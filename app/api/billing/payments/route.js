import { NextResponse } from "next/server";
import { queryOne, isUniqueViolation } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { completePayment, createPaymentRow, getSchoolBilling, listPayments } from "@/lib/subscription-billing";

/**
 * Admin: School ERP subscription payments.
 *
 * GET  ?client_id=  — payment history (all schools, or one), newest first
 * POST { client_id, periods?, amount?, channel?, trx_id?, note?, plan_id? }
 *      — record a payment received outside the gateways (cash, bank, bKash send-money ...).
 *        It is completed at once and extends the subscription like a gateway payment, which
 *        unlocks an expired school on its next subscription check.
 */

const CHANNELS = ["cash", "bank", "bkash", "nagad", "cheque", "other"];

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  try {
    const clientId = new URL(request.url).searchParams.get("client_id") || undefined;
    const rows = await listPayments({ clientId, limit: 500 });
    return NextResponse.json(rows.map((r) => ({ ...r, amount: Number(r.amount) })));
  } catch (error) {
    console.error("[billing/payments GET]", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const { client, sub } = await getSchoolBilling(String(body.client_id || ""));
    if (!client) return NextResponse.json({ error: "School not found" }, { status: 404 });
    if (client.client_type !== "school_erp") {
      return NextResponse.json({ error: "Payments are recorded here only for School ERP schools" }, { status: 400 });
    }

    const periods = Number(body.periods ?? 1);
    if (!Number.isInteger(periods) || periods < 1 || periods > 10) {
      return NextResponse.json({ error: "periods must be a whole number from 1 to 10" }, { status: 400 });
    }

    let planId = sub?.plan_id;
    let price = sub ? Number(sub.price) : null;
    if (body.plan_id) {
      const plan = await queryOne("SELECT id, price, plan_type FROM plans WHERE id = ?", [body.plan_id]);
      if (!plan || plan.plan_type !== "school_erp") {
        return NextResponse.json({ error: "Select a School ERP plan" }, { status: 400 });
      }
      planId = plan.id;
      price = Number(plan.price);
    }
    if (!planId) return NextResponse.json({ error: "This school has no plan; select one" }, { status: 400 });

    // The admin may record a discounted/partial amount; default is the plan price for the terms
    const amount = body.amount === undefined || body.amount === "" ? price * periods : Number(body.amount);
    if (!Number.isFinite(amount) || amount < 0 || amount > 10000000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const channel = CHANNELS.includes(body.channel) ? body.channel : "cash";
    const trxId = String(body.trx_id || "").trim().slice(0, 100) || null;
    if (trxId) {
      const dup = await queryOne("SELECT id FROM subscription_payments WHERE trx_id = ?", [trxId]);
      if (dup) return NextResponse.json({ error: "This transaction ID is already recorded" }, { status: 409 });
    }

    const row = await createPaymentRow({
      client_id: client.id,
      plan_id: planId,
      subscription_id: sub?.id,
      method: "manual",
      source: "admin",
      channel,
      periods,
      amount,
      trx_id: trxId,
      recorded_by: auth.user.id,
      note: String(body.note || "").slice(0, 500) || null,
    });
    const done = await completePayment(row.id, { trusted: true });
    if (!done.ok) return NextResponse.json({ error: done.reason }, { status: 400 });

    return NextResponse.json(
      { message: "Payment recorded and subscription extended", invoice: row.merchant_invoice, period_end: done.period_end },
      { status: 201 }
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "This transaction ID is already recorded" }, { status: 409 });
    }
    console.error("[billing/payments POST]", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
