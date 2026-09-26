import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { withParams } from "@/lib/safe-redirect";
import { clientIp } from "@/lib/auth";
import { nagadVerifyPayment } from "@/lib/payments/nagad";
import { completePayment, getPayment, markPaymentFailed, returnTarget } from "@/lib/subscription-billing";

/**
 * GET /api/payments/nagad/callback?invoice=&order_id=&payment_ref_id=&status=
 *
 * Nagad sends the customer's browser here. The query string is not trusted: the payment is
 * verified with Nagad (verify/payment), and the order ID, reference and amount must match the
 * attempt we created before the subscription is extended (once).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const invoice = searchParams.get("invoice") || searchParams.get("order_id") || "";
  const refId = searchParams.get("payment_ref_id") || "";
  const status = (searchParams.get("status") || "").toLowerCase();

  const payment = invoice ? await getPayment("invoice", invoice) : null;
  const client = payment ? await queryOne("SELECT domain FROM clients WHERE id = ?", [payment.client_id]) : null;
  const back = (result, extra = {}) =>
    NextResponse.redirect(withParams(returnTarget(payment, client?.domain), { payment: result, invoice: payment?.merchant_invoice, ...extra }), 303);

  const orderId = searchParams.get("order_id");
  if (!payment || payment.method !== "nagad" || (orderId && orderId !== payment.merchant_invoice)) {
    return back("invalid");
  }
  if (refId && payment.gateway_payment_id && refId !== payment.gateway_payment_id) return back("invalid");
  if (payment.status === "completed") return back("success", { trx_id: payment.trx_id });

  if (["aborted", "cancelled", "cancel"].includes(status)) {
    await markPaymentFailed(payment.id, "cancelled", `nagad_callback_${status}`);
    return back("cancelled");
  }

  try {
    const result = await nagadVerifyPayment(refId || payment.gateway_payment_id, payment.merchant_invoice, clientIp(request));
    if (!result.ok) {
      await markPaymentFailed(payment.id, "failed", `nagad_not_success: ${result.status}`, result.raw);
      return back("failed");
    }
    const done = await completePayment(payment.id, { trxId: result.trxId, paidAmount: result.amount, raw: result.raw });
    if (!done.ok) return back("failed", { reason: done.reason });
    return back("success", { trx_id: result.trxId });
  } catch (error) {
    console.error("[Nagad callback]", error.message);
    return back("error");
  }
}
