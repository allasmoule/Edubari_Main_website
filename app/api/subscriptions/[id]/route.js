import { NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import crypto from "crypto";

/**
 * GET /api/subscriptions/:id
 * Fetch a single subscription request by ID.
 */
export async function GET(request, { params }) {
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
 * On approval, auto-creates or renews the client + active subscription.
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const isApprove = body.verified === true || body.adminStatus === "reviewed";

    if (isApprove) {
      // 1. Fetch subscription request
      const reqData = await queryOne("SELECT * FROM subscription_requests WHERE id = ?", [id]);
      if (!reqData) {
        return NextResponse.json({ error: "Subscription request not found" }, { status: 404 });
      }

      // If already verified, just return current state
      if (reqData.verified) {
        return NextResponse.json({
          message: "Subscription request already verified",
          subscription: { ...reqData, _id: reqData.id, adminStatus: "reviewed" },
        });
      }

      // 2. Get associated plan
      let plan = null;
      if (reqData.selected_plan_id) {
        plan = await queryOne("SELECT * FROM plans WHERE id = ?", [reqData.selected_plan_id]);
      }

      // If no plan found by ID, try matching by name (fallback)
      if (!plan && reqData.selected_plan_name) {
        plan = await queryOne("SELECT * FROM plans WHERE plan_name = ? LIMIT 1", [reqData.selected_plan_name]);
      }

      if (!plan) {
        // Create subscription without plan — just mark verified (manual approval)
        await execute("UPDATE subscription_requests SET verified = 1 WHERE id = ?", [id]);
        const updated = await queryOne("SELECT * FROM subscription_requests WHERE id = ?", [id]);
        return NextResponse.json({
          message: "Subscription marked as reviewed (no matching plan found)",
          subscription: { ...updated, _id: updated.id, adminStatus: "reviewed" },
        });
      }

      const domain = reqData.preferred_domain?.trim().toLowerCase();

      // 3. Check if client with this domain already exists
      const existingClient = await queryOne("SELECT * FROM clients WHERE domain = ?", [domain]);

      let clientId = null;
      const start = new Date();
      let durationDays = plan.duration_days || 30;
      let activeSubToRestore = null;

      if (existingClient) {
        // --- RENEWAL / EXTENSION FLOW ---
        clientId = existingClient.id;

        // Carry over remaining days from active subscription
        const activeSub = await queryOne(
          "SELECT * FROM subscriptions WHERE client_id = ? AND is_current = 1 LIMIT 1",
          [clientId]
        );

        if (activeSub) {
          activeSubToRestore = activeSub;
          const activeEnd = new Date(activeSub.end_date);
          const now = new Date();
          if (now < activeEnd) {
            const remainingMs = activeEnd.getTime() - now.getTime();
            const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
            durationDays += remainingDays;
          }
          // Deactivate old subscription
          await execute("UPDATE subscriptions SET is_current = 0 WHERE client_id = ?", [clientId]);
        }

        // Ensure client is active
        await execute("UPDATE clients SET status = 'active' WHERE id = ?", [clientId]);
      } else {
        // --- NEW CLIENT REGISTRATION FLOW ---
        clientId = crypto.randomUUID();
        await execute(
          "INSERT INTO clients (id, client_name, domain, phone, status, client_type) VALUES (?, ?, ?, ?, 'active', 'single_teacher')",
          [clientId, reqData.institution_name, domain, reqData.phone || null]
        );
      }

      // 4. Calculate dates
      const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const grace = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000);

      // 5. Create active subscription
      const subId = crypto.randomUUID();
      try {
        await execute(
          `INSERT INTO subscriptions (id, client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status)
           VALUES (?, ?, ?, ?, ?, ?, 1, 'paid')`,
          [subId, clientId, plan.id, start, end, grace]
        );
      } catch (subErr) {
        // Rollback: re-activate old subscription or delete new client
        if (!existingClient && clientId) {
          await execute("DELETE FROM clients WHERE id = ?", [clientId]).catch(() => {});
        } else if (existingClient && activeSubToRestore) {
          await execute("UPDATE subscriptions SET is_current = 1 WHERE id = ?", [activeSubToRestore.id]).catch(() => {});
        }
        throw subErr;
      }
    }

    // 6. Update the subscription_requests record
    await execute("UPDATE subscription_requests SET verified = 1 WHERE id = ?", [id]);

    const updated = await queryOne("SELECT * FROM subscription_requests WHERE id = ?", [id]);
    if (!updated) {
      return NextResponse.json({ error: "Subscription request not found after update" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Subscription approved and activated successfully",
      subscription: { ...updated, _id: updated.id, adminStatus: "reviewed" },
    });
  } catch (error) {
    console.error("Error updating subscription:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/subscriptions/:id
 */
export async function DELETE(request, { params }) {
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
