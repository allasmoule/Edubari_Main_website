import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { withParams } from "@/lib/safe-redirect";
import { bkashVerifyPayment } from "@/lib/payments/bkash";
import { completePayment, getPayment, markPaymentFailed, returnTarget } from "@/lib/subscription-billing";

/**
 * GET /api/payments/bkash/callback?invoice=&paymentID=&status=success|failure|cancel
 *
 * bKash sends the customer's browser here. The query string is not trusted: the payment is
 * executed/queried with bKash itself, and the invoice, paymentID and amount must all match the
 * attempt we created. Only then is the subscription extended (once), and the customer is sent
 * back to the School ERP page they came from.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const invoice = searchParams.get("invoice") || "";
  const paymentID = searchParams.get("paymentID") || "";
  const status = (searchParams.get("status") || "").toLowerCase();

  const payment = invoice ? await getPayment("invoice", invoice) : null;
  const client = payment ? await queryOne("SELECT domain FROM clients WHERE id = ?", [payment.client_id]) : null;
  const back = (result, extra = {}) =>
    NextResponse.redirect(withParams(returnTarget(payment, client?.domain), { payment: result, invoice: payment?.merchant_invoice, ...extra }), 303);

  if (!payment || payment.method !== "bkash" || !paymentID || payment.gateway_payment_id !== paymentID) {
    return back("invalid");
  }
  if (payment.status === "completed") return back("success", { trx_id: payment.trx_id });

  if (status !== "success") {
    await markPaymentFailed(payment.id, status === "cancel" ? "cancelled" : "failed", `bkash_callback_${status || "unknown"}`);
    return back(status === "cancel" ? "cancelled" : "failed");
  }

  try {
    const result = await bkashVerifyPayment(paymentID);
    if (!result.ok || (result.invoice && result.invoice !== payment.merchant_invoice)) {
      await markPaymentFailed(payment.id, "failed", `bkash_not_completed: ${result.status}`, result.raw);
      return back("failed");
    }
    const done = await completePayment(payment.id, { trxId: result.trxId, paidAmount: result.amount, raw: result.raw });
    if (!done.ok) return back("failed", { reason: done.reason });
    return back("success", { trx_id: result.trxId });
  } catch (error) {
    // Leave the attempt as it is: the money may have moved, so an admin can re-check it with bKash
    console.error("[bKash callback]", error.message);
    return back("error");
  }
}
