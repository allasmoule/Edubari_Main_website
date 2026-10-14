import { NextResponse } from "next/server";
import crypto from "crypto";
import { queryOne, isUniqueViolation } from "@/lib/db";
import { createAiPurchaseRequest, updatePurchaseRequestStatus, getAiPackages } from "@/lib/ai-database";
import { getAdmin } from "@/lib/auth";
import { cleanDomain, safeRedirectUrl, withParams } from "@/lib/safe-redirect";
import { sendPaymentNotificationEmail } from "@/lib/email";

/**
 * AI credit payment callbacks.
 *
 * POST — server-to-server notification from a payment gateway. It is accepted only when it is
 *        signed with AI_GATEWAY_WEBHOOK_SECRET (header X-Edubari-Signature = hex HMAC-SHA256 of
 *        the raw body) or sent by a signed-in admin. Credits and price always come from the
 *        package on the server, and one transaction ID can credit only once.
 * GET  — Stripe success redirect. The paid session itself says which domain/package it was for.
 */

function validWebhookSignature(rawBody, signature) {
  const secret = process.env.AI_GATEWAY_WEBHOOK_SECRET;
  if (!secret || secret.length < 32 || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(String(signature).toLowerCase());
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Credit a domain once per transaction ID (repeat calls return the earlier result) */
async function creditOnce({ domain, pkg, transactionId, paymentMethod, userName, userPhone }) {
  const existing = await queryOne("SELECT id, status FROM ai_purchase_requests WHERE transaction_id = ?", [transactionId]);
  if (existing) return { duplicate: true, request: existing };
  let req;
  try {
    req = await createAiPurchaseRequest({
      domain,
      userName: userName || "Automated Gateway",
      userPhone: userPhone || "N/A",
      packageId: pkg.id,
      packageName: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
      currency: pkg.currency || "BDT",
      paymentMethod,
      transactionId,
      status: "pending",
    });
  } catch (error) {
    // Two deliveries of the same webhook at once: the unique transaction_id lets only one through
    if (!isUniqueViolation(error)) throw error;
    const winner = await queryOne("SELECT id, status FROM ai_purchase_requests WHERE transaction_id = ?", [transactionId]);
    return { duplicate: true, request: winner };
  }
  await updatePurchaseRequestStatus(req.id, "approved");

  sendPaymentNotificationEmail({
    invoice: req.id,
    trxId: transactionId,
    method: paymentMethod,
    amount: pkg.price,
    domain,
    planName: `${pkg.name} (${pkg.credits} AI Credits)`,
    status: "approved",
  }).catch((mailErr) => {
    console.error("AI payment callback email error:", mailErr.message);
  });

  return { duplicate: false, request: { ...req, status: "approved" } };
}

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signed = validWebhookSignature(rawBody, request.headers.get("x-edubari-signature"));
    if (!signed && !(await getAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized payment notification" }, { status: 401 });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody || "{}");
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const domain = cleanDomain(payload.domain);
    const transactionId = String(payload.transactionId || "").trim().slice(0, 100);
    if (!domain || !payload.packageId || !transactionId) {
      return NextResponse.json({ error: "Missing required parameters (domain, packageId, transactionId)" }, { status: 400 });
    }
    const pkg = (await getAiPackages()).find((p) => p.id === payload.packageId);
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    const result = await creditOnce({
      domain,
      pkg,
      transactionId,
      paymentMethod: String(payload.paymentMethod || "gateway").slice(0, 50),
      userName: payload.userName,
      userPhone: payload.userPhone,
    });

    return NextResponse.json({
      success: true,
      duplicate: result.duplicate,
      message: result.duplicate ? "Transaction already processed." : "Callback processed successfully. Domain wallet credited.",
      transactionId,
    });
  } catch (error) {
    console.error("Error processing payment callback:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  // Only ever send the customer to a trusted site (their own domain or this website)
  const fallback = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const redirectBase = safeRedirectUrl(searchParams.get("redirect_url"), { domain: searchParams.get("domain") }) || fallback;

  if (!sessionId || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(withParams(redirectBase, { payment: "failed" }));
  }

  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const domain = cleanDomain(session.metadata?.domain);
    const packageId = session.metadata?.package_id;

    if (session.payment_status !== "paid" || !domain || !packageId) {
      return NextResponse.redirect(withParams(redirectBase, { payment: "failed" }));
    }
    const pkg = (await getAiPackages()).find((p) => p.id === packageId);
    if (!pkg) return NextResponse.redirect(withParams(redirectBase, { payment: "failed" }));

    await creditOnce({
      domain,
      pkg,
      transactionId: sessionId,
      paymentMethod: "stripe",
      userName: session.customer_details?.name || "Stripe Customer",
      userPhone: session.customer_details?.phone || "N/A",
    });

    const successBase = safeRedirectUrl(searchParams.get("redirect_url"), { domain }) || fallback;
    return NextResponse.redirect(withParams(successBase, { payment: "success", txn_id: sessionId, credits_added: pkg.credits }));
  } catch (error) {
    console.error("Error processing Stripe success callback:", error.message);
    return NextResponse.redirect(withParams(redirectBase, { payment: "error" }));
  }
}
