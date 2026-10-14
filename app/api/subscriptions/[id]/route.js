import { NextResponse } from "next/server";
import { queryOne, execute, withTransaction, isUniqueViolation } from "@/lib/db";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";
import { cleanDomain } from "@/lib/safe-redirect";
import { GRACE_DAYS, newInvoice } from "@/lib/subscription-billing";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * GET /api/subscriptions/:id
 * Fetch a single subscription request by ID.
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;

    const row = await queryOne("SELECT * FROM subscription_requests WHERE id = ?", [id]);
    if (!row) {
      return NextResponse.json({ error: "Subscription request not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...row,
      _id: row.id,
      adminStatus: row.verified ? "reviewed" : "pending",
    });
  } catch (error) {
    console.error("Error fetching subscription request:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/subscriptions/:id
 * Approve/verify a subscription request.
 * On approval, auto-creates or renews the client + active subscription — all in one transaction,
 * so a failure half way never leaves a school without a current subscription.
 */
export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    const isApprove = body.verified === true || body.adminStatus === "reviewed";

    const result = await withTransaction(async (tx) => {
      // Lock the request: two admins approving at once cannot create two schools/subscriptions
      const reqData = await tx.queryOne("SELECT * FROM subscription_requests WHERE id = ? FOR UPDATE", [id]);
      if (!reqData) return { status: 404, body: { error: "Subscription request not found" } };

      if (!isApprove || reqData.verified) {
        if (reqData.verified) {
          return { body: { message: "Subscription request already verified", subscription: reqData } };
        }
        const updated = await tx.queryOne("UPDATE subscription_requests SET verified = TRUE WHERE id = ? RETURNING *", [id]);
        return { body: { message: "Subscription request marked as reviewed", subscription: updated } };
      }

      // Plan: by id, else by name (older orders only stored the name)
      let plan = reqData.selected_plan_id
        ? await tx.queryOne("SELECT * FROM plans WHERE id = ?", [reqData.selected_plan_id])
        : null;
      if (!plan && reqData.selected_plan_name) {
        plan = await tx.queryOne("SELECT * FROM plans WHERE plan_name = ? LIMIT 1", [reqData.selected_plan_name]);
      }

      if (!plan) {
        // No plan to activate — just mark it reviewed (manual follow-up)
        const updated = await tx.queryOne("UPDATE subscription_requests SET verified = TRUE WHERE id = ? RETURNING *", [id]);
        return { body: { message: "Subscription marked as reviewed (no matching plan found)", subscription: updated } };
      }

      // Only School ERP schools are added from here (single-teacher sign-ups are no longer created)
      if (plan.plan_type !== "school_erp") {
        return { status: 400, body: { error: "Only School ERP plans can be approved here" } };
      }

      const domain = cleanDomain(reqData.preferred_domain);
      if (!domain || domain === "n/a") {
        return { status: 400, body: { error: "This request has no valid domain" } };
      }

      const existingClient = await tx.queryOne("SELECT * FROM clients WHERE domain = ? FOR UPDATE", [domain]);
      const start = new Date();
      let durationDays = Number(plan.duration_days) || 30;
      let clientId;

      if (existingClient) {
        // --- RENEWAL / EXTENSION: carry over the remaining days of the current term ---
        clientId = existingClient.id;
        const activeSub = await tx.queryOne(
          "SELECT * FROM subscriptions WHERE client_id = ? AND is_current LIMIT 1 FOR UPDATE",
          [clientId]
        );
        if (activeSub) {
          const remainingMs = new Date(activeSub.end_date).getTime() - start.getTime();
          if (remainingMs > 0) durationDays += Math.ceil(remainingMs / DAY_MS);
          await tx.execute("UPDATE subscriptions SET is_current = FALSE WHERE client_id = ? AND is_current", [clientId]);
        }
        await tx.execute("UPDATE clients SET status = 'active' WHERE id = ?", [clientId]);
      } else {
        // --- NEW SCHOOL ERP: same credentials as a school added from the admin panel ---
        clientId = crypto.randomUUID();
        const erpToken = crypto.randomBytes(32).toString("hex");
        const erpSecret = crypto.randomBytes(32).toString("hex");
        await tx.execute(
          `INSERT INTO clients (id, client_name, domain, phone, status, client_type, erp_api_token, erp_secret)
           VALUES (?, ?, ?, ?, 'active', 'school_erp', ?, ?)`,
          [clientId, reqData.institution_name, domain, reqData.phone || null, erpToken, erpSecret]
        );
        await tx.execute(
          `INSERT INTO erp_connections (id, client_id, domain, erp_api_token, connection_status)
           VALUES (?, ?, ?, ?, 'pending')`,
          [crypto.randomUUID(), clientId, domain, erpToken]
        );
      }

      const end = new Date(start.getTime() + durationDays * DAY_MS);
      const grace = new Date(end.getTime() + GRACE_DAYS * DAY_MS);
      const subId = crypto.randomUUID();
      await tx.execute(
        `INSERT INTO subscriptions (id, client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, TRUE, 'paid')`,
        [subId, clientId, plan.id, start, end, grace]
      );

      // Keep the approval in the school's payment history (the admin checked the payment)
      await tx.execute(
        `INSERT INTO subscription_payments
           (id, client_id, plan_id, subscription_id, method, source, channel, periods, amount, currency, status,
            merchant_invoice, recorded_by, note, period_start, period_end, completed_at)
         VALUES (?, ?, ?, ?, 'manual', 'admin', 'request_approval', 1, ?, 'BDT', 'completed', ?, ?, ?, ?, ?, NOW())`,
        [crypto.randomUUID(), clientId, plan.id, subId, (Number(plan.price) || 0).toFixed(2), newInvoice(), auth.user.id,
          `Subscription request ${id} approved`, start, end]
      );

      const updated = await tx.queryOne("UPDATE subscription_requests SET verified = TRUE WHERE id = ? RETURNING *", [id]);
      return { body: { message: "Subscription approved and activated successfully", subscription: updated } };
    });

    const { subscription } = result.body;
    if (subscription) result.body.subscription = { ...subscription, _id: subscription.id, adminStatus: "reviewed" };
    return NextResponse.json(result.body, { status: result.status || 200 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "This domain or ERP token is already registered" }, { status: 409 });
    }
    console.error("Error updating subscription:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/subscriptions/:id
 */
export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const existing = await queryOne("SELECT id FROM subscription_requests WHERE id = ?", [id]);
    if (!existing) {
      return NextResponse.json({ error: "Subscription request not found" }, { status: 404 });
    }

    await execute("DELETE FROM subscription_requests WHERE id = ?", [id]);
    return NextResponse.json({ message: "Subscription request deleted" });
  } catch (error) {
    console.error("Error deleting subscription request:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
