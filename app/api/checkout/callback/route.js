import { NextResponse } from "next/server";
import { createAiPurchaseRequest, updatePurchaseRequestStatus, getAiPackages } from "@/lib/ai-database";

// Handle POST callbacks (Simulated Sandbox Webhook or standard Gateway IPN)
export async function POST(request) {
  try {
    const payload = await request.json();
    const { domain, packageId, packageName, credits, price, currency, paymentMethod, transactionId } = payload;

    if (!domain || !packageId || !transactionId) {
      return NextResponse.json({ error: "Missing required parameters (domain, packageId, transactionId)" }, { status: 400 });
    }

    console.log(`[IPN Webhook] Received successful automated payment callback for domain: ${domain}, Txn: ${transactionId}`);

    // 1. Create a request with "approved" status instantly
    const req = await createAiPurchaseRequest({
      domain,
      userName: payload.userName || "Automated Gateway",
      userPhone: payload.userPhone || "N/A",
      packageId,
      packageName: packageName || "AI Pack",
      credits: Number(credits || 0),
      price: Number(price || 0),
      currency: currency || "BDT",
      paymentMethod: paymentMethod || "gateway",
      transactionId,
      status: "approved", // instantly approved
    });

    // 2. Trigger the ledger credit update via the DB manager (credits user's domain active wallet)
    await updatePurchaseRequestStatus(req.id, "approved");

    return NextResponse.json({
      success: true,
      message: "Callback processed successfully. Domain wallet credited.",
      transactionId,
    });
  } catch (error) {
    console.error("Error processing IPN callback:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// Handle GET callbacks (Stripe Session Success Redirect)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const domain = searchParams.get("domain");
  const packageId = searchParams.get("package_id");
  const redirectUrl = searchParams.get("redirect_url");

  if (!sessionId || !domain || !packageId || !redirectUrl) {
    return NextResponse.json({ error: "Invalid callback redirect parameters" }, { status: 400 });
  }

  try {
    // 1. Verify Stripe session if configured
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        const packages = await getAiPackages();
        const matchedPkg = packages.find((p) => p.id === packageId) || {
          name: "Stripe Package",
          credits: 10,
          price: 179,
        };

        // Create approved request keyed by domain
        const req = await createAiPurchaseRequest({
          domain,
          userName: session.customer_details?.name || "Stripe Customer",
          userPhone: session.customer_details?.phone || "N/A",
          packageId,
          packageName: matchedPkg.name,
          credits: matchedPkg.credits,
          price: matchedPkg.price,
          currency: matchedPkg.currency || "BDT",
          paymentMethod: "stripe",
          transactionId: sessionId,
          status: "approved",
        });

        // Add credits to domain wallet
        await updatePurchaseRequestStatus(req.id, "approved");

        // Redirect back to LMS with success
        const lmsRedirect = `${redirectUrl}${redirectUrl.includes("?") ? "&" : "?"}payment=success&txn_id=${sessionId}`;
        return NextResponse.redirect(lmsRedirect);
      }
    }

    // Fallback if Stripe redirect was hit but unpaid or not setup
    const failureRedirect = `${redirectUrl}${redirectUrl.includes("?") ? "&" : "?"}payment=failed`;
    return NextResponse.redirect(failureRedirect);
  } catch (error) {
    console.error("Error processing Stripe success callback:", error);
    const failureRedirect = `${redirectUrl}${redirectUrl.includes("?") ? "&" : "?"}payment=error`;
    return NextResponse.redirect(failureRedirect);
  }
}
