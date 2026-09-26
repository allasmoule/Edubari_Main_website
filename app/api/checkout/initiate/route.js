import { NextResponse } from "next/server";
import { getAiPackages } from "@/lib/ai-database";
import { cleanDomain, safeRedirectUrl } from "@/lib/safe-redirect";

export async function POST(request) {
  try {
    const body = await request.json();
    const domain = cleanDomain(body.domain);
    const { packageId } = body;

    if (!domain || !packageId || !body.redirectUrl) {
      return NextResponse.json({ error: "Missing required parameters (domain, packageId, redirectUrl)" }, { status: 400 });
    }
    // The customer is only ever sent back to their own domain / this website
    const redirectUrl = safeRedirectUrl(body.redirectUrl, { domain });
    if (!redirectUrl) {
      return NextResponse.json({ error: "redirectUrl must be on your own domain" }, { status: 400 });
    }

    // 1. Fetch packages to verify and get pricing details
    const packages = await getAiPackages();
    const matchedPkg = packages.find((p) => p.id === packageId);

    if (!matchedPkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Our own address comes from configuration, not from the (spoofable) Host header
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/+$/, "");

    // 2. Stripe integration placeholder check
    // If STRIPE_SECRET_KEY is present in environment, we generate a Stripe session.
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: matchedPkg.currency?.toLowerCase() || "bdt",
                product_data: {
                  name: matchedPkg.name,
                  description: `${matchedPkg.credits} AI Generator Credits for domain ${domain}`,
                },
                unit_amount: Math.round(matchedPkg.price * 100), // in cents/poisha
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          // The callback trusts these, not its query string
          metadata: { domain, package_id: packageId },
          success_url: `${origin}/api/checkout/callback?session_id={CHECKOUT_SESSION_ID}&domain=${encodeURIComponent(domain)}&redirect_url=${encodeURIComponent(redirectUrl)}`,
          cancel_url: `${redirectUrl}`,
        });

        return NextResponse.json({ checkoutUrl: session.url });
      } catch (stripeErr) {
        console.error("Stripe session creation failed, falling back to central checkout UI:", stripeErr);
      }
    }

    // 3. Fallback to Central Website checkout flow (Manual & Simulated gateway)
    const checkoutUrl = `${origin}/checkout?domain=${encodeURIComponent(domain)}&package_id=${encodeURIComponent(packageId)}&redirect_url=${encodeURIComponent(redirectUrl)}`;
    
    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Error initiating checkout:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
