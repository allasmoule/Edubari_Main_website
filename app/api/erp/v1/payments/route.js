import { NextResponse } from "next/server";
import { execute, queryOne } from "@/lib/db";
import { authenticateErp } from "@/lib/erp-auth";
import { safeRedirectUrl } from "@/lib/safe-redirect";
import { bkashConfigured, bkashCreatePayment } from "@/lib/payments/bkash";
import { nagadConfigured, nagadCreatePayment } from "@/lib/payments/nagad";
import { clientIp } from "@/lib/auth";
import {
  callbackBase,
  createPaymentRow,
  getSchoolBilling,
  listPayments,
  markPaymentFailed,
  setGatewayPaymentId,
  subscriptionState,
} from "@/lib/subscription-billing";

/**
 * School ERP → subscription payment (signed with the school's ERP secret, see lib/erp-auth.js).
 *
 * GET  — the school's subscription status, the amount due for one term, the payment methods that
 *        are switched on, and its payment history. The ERP shows this on its locked/payment page.
 * POST — { method: "bkash" | "nagad", periods?: 1-5, return_url? } starts a payment and returns
 *        redirect_url; the ERP sends the user's browser there. The amount is always the plan price
 *        from this server. After payment the gateway returns to /api/payments/{method}/callback,
 *        which verifies with the gateway, extends the subscription and redirects to return_url.
 */

function methods() {
  return { bkash: bkashConfigured(), nagad: nagadConfigured() };
}

function summary(client, sub) {
  return {
    domain: client.domain,
    client_name: client.client_name,
    client_status: client.status,
    status: subscriptionState(sub),
    plan: sub ? { id: sub.plan_id, name: sub.plan_name, price: Number(sub.price), duration_days: sub.duration_days } : null,
    end_date: sub?.end_date || null,
    grace_end_date: sub?.grace_end_date || null,
    amount_per_term: sub ? Number(sub.price) : null,
    methods: methods(),
  };
}

export async function GET(request) {
  const auth = await authenticateErp(request);
  if (auth.response) return auth.response;
  try {
    const { client, sub } = await getSchoolBilling(auth.client.id);
    // The ERP asks here on every login and hourly, so this doubles as its heartbeat
    await execute(
      "UPDATE erp_connections SET last_ping_at = NOW(), connection_status = 'connected' WHERE client_id = ?",
      [client.id]
    ).catch(() => {});
    const payments = (await listPayments({ clientId: client.id, limit: 50 })).map((p) => ({
      invoice: p.merchant_invoice,
      method: p.method,
      amount: Number(p.amount),
      status: p.status,
      trx_id: p.trx_id,
      plan_name: p.plan_name,
      periods: p.periods,
      period_start: p.period_start,
      period_end: p.period_end,
      created_at: p.created_at,
      completed_at: p.completed_at,
    }));
    return NextResponse.json({ ...summary(client, sub), payments });
  } catch (error) {
    console.error("[ERP payments GET]", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await authenticateErp(request);
  if (auth.response) return auth.response;

  let body;
  try {
    body = JSON.parse(auth.rawBody || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const method = String(body.method || "").toLowerCase();
  if (method !== "bkash" && method !== "nagad") {
    return NextResponse.json({ error: "method must be bkash or nagad" }, { status: 400 });
  }
  if (!methods()[method]) {
    return NextResponse.json({ error: `${method} payment is not configured yet` }, { status: 503 });
  }
  const periods = Number(body.periods ?? 1);
  if (!Number.isInteger(periods) || periods < 1 || periods > 5) {
    return NextResponse.json({ error: "periods must be a whole number from 1 to 5" }, { status: 400 });
  }

  const { client, sub } = await getSchoolBilling(auth.client.id);
  if (client.status === "suspended") {
    return NextResponse.json({ error: "This school is suspended. Contact EduBari support." }, { status: 403 });
  }
  if (!sub || sub.plan_type !== "school_erp") {
    return NextResponse.json({ error: "No School ERP plan is assigned to this school. Contact EduBari." }, { status: 409 });
  }
  const amount = Number(sub.price) * periods;
  if (!(amount > 0)) {
    return NextResponse.json({ error: "This plan has no price set. Contact EduBari." }, { status: 409 });
  }

  let returnUrl = null;
  if (body.return_url) {
    returnUrl = safeRedirectUrl(body.return_url, { domain: client.domain });
    if (!returnUrl) {
      return NextResponse.json({ error: "return_url must be on the school's own domain" }, { status: 400 });
    }
  }

  const base = callbackBase();
  if (!base) {
    return NextResponse.json({ error: "Payment callback URL is not configured on the server" }, { status: 503 });
  }

  // A school cannot open unlimited unpaid attempts
  const recent = await queryOne(
    `SELECT COUNT(*) AS n FROM subscription_payments
      WHERE client_id = ? AND status = 'initiated' AND created_at > (NOW() - INTERVAL 10 MINUTE)`,
    [client.id]
  );
  if (Number(recent?.n) >= 10) {
    return NextResponse.json({ error: "Too many payment attempts. Try again in a few minutes." }, { status: 429 });
  }

  const payment = await createPaymentRow({
    client_id: client.id,
    plan_id: sub.plan_id,
    subscription_id: sub.id,
    method,
    periods,
    amount,
    return_url: returnUrl,
    payer_reference: client.domain,
  });

  try {
    const callbackURL = `${base}/api/payments/${method}/callback?invoice=${payment.merchant_invoice}`;
    let redirectUrl;
    if (method === "bkash") {
      const res = await bkashCreatePayment({
        amount,
        invoice: payment.merchant_invoice,
        payerReference: client.domain,
        callbackURL,
      });
      await setGatewayPaymentId(payment.id, res.paymentID, { create: res.raw });
      redirectUrl = res.bkashURL;
    } else {
      const res = await nagadCreatePayment({
        amount,
        orderId: payment.merchant_invoice,
        callbackURL,
        ip: body.customer_ip || clientIp(request),
      });
      await setGatewayPaymentId(payment.id, res.paymentRefId, res.raw);
      redirectUrl = res.redirectUrl;
    }

    return NextResponse.json(
      { invoice: payment.merchant_invoice, method, amount, currency: "BDT", periods, redirect_url: redirectUrl },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[ERP payments POST] ${method}:`, error.message);
    await markPaymentFailed(payment.id, "failed", error.message, error.raw).catch(() => {});
    return NextResponse.json({ error: `Could not start ${method} payment. Please try again.` }, { status: 502 });
  }
}
