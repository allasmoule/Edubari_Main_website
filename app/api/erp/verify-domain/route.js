import { NextResponse } from "next/server";
import crypto from "crypto";
import { query, queryOne, execute } from "@/lib/db";
import { authenticateErp } from "@/lib/erp-auth";

/**
 * GET /api/erp/verify-domain
 *
 * Subscription status + plan limits for one School ERP. The caller must prove it is that school:
 *   - signed headers (X-Edubari-Token/Timestamp/Nonce/Signature, see lib/erp-auth.js) — preferred, or
 *   - ?token=&secret= (both required; the secret used to be optional, which let anyone holding
 *     a token read the school's billing data).
 */
function sameSecret(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y);
}

export async function GET(request) {
  try {
    let client;
    let token;
    if (request.headers.get("x-edubari-signature")) {
      const auth = await authenticateErp(request);
      if (auth.response) return auth.response;
      client = auth.client;
      token = client.erp_api_token;
    } else {
      const { searchParams } = new URL(request.url);
      token = searchParams.get("token");
      const secret = searchParams.get("secret");
      if (!token || !secret) {
        return NextResponse.json({ error: "Missing API token or secret" }, { status: 401 });
      }
      client = await queryOne("SELECT * FROM clients WHERE erp_api_token = ?", [token]);
      if (!client || !sameSecret(secret, client.erp_secret)) {
        return NextResponse.json({ error: "Invalid API credentials." }, { status: 403 });
      }
    }

    if (client.status === "suspended") {
      return NextResponse.json({
        active: false,
        status: "suspended",
        domain: client.domain,
        client_name: client.client_name,
        message: "This ERP instance has been suspended. Contact EduBari support.",
      }, { status: 403 });
    }

    // Get active subscription with plan details
    const sub = await queryOne(
      `SELECT s.*, p.plan_name, p.plan_type, p.max_students, p.max_instructors,
              p.max_batches, p.monthly_ai_credits, p.show_branding, p.feature_gates,
              p.price, p.duration_days, p.plan_tier
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.client_id = ? AND s.is_current = 1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [client.id]
    );

    const now = new Date();
    let subscriptionStatus = "no_subscription";
    let isActive = false;

    if (sub) {
      const endDate = new Date(sub.end_date);
      const graceDate = new Date(sub.grace_end_date);

      if (now < endDate) {
        subscriptionStatus = "active";
        isActive = true;
      } else if (now < graceDate) {
        subscriptionStatus = "grace_period";
        isActive = true; // still allow access in grace
      } else {
        subscriptionStatus = "expired";
        isActive = false;
      }
    }

    // Update last ping on erp_connections
    await execute(
      `UPDATE erp_connections SET last_ping_at = NOW(), connection_status = 'connected' WHERE erp_api_token = ?`,
      [token]
    ).catch(() => {}); // non-blocking, don't fail if row doesn't exist

    let featureGates = {};
    try {
      featureGates = typeof sub?.feature_gates === "string"
        ? JSON.parse(sub.feature_gates)
        : (sub?.feature_gates || {});
    } catch (_) {}

    // Completed payments (gateway or recorded by an admin), for the ERP's billing page
    const payments = await query(
      `SELECT sp.merchant_invoice AS invoice, sp.method, sp.channel, sp.amount, sp.trx_id, sp.periods,
              sp.period_start, sp.period_end, sp.completed_at, p.plan_name
         FROM subscription_payments sp LEFT JOIN plans p ON p.id = sp.plan_id
        WHERE sp.client_id = ? AND sp.status = 'completed'
        ORDER BY sp.completed_at DESC LIMIT 24`,
      [client.id]
    ).catch(() => []);

    return NextResponse.json({
      active: isActive,
      payment_required: subscriptionStatus !== "active",
      payment_endpoint: "/api/erp/v1/payments",
      status: subscriptionStatus,
      domain: client.domain,
      client_name: client.client_name,
      client_type: client.client_type,
      plan: sub ? {
        id: sub.plan_id,
        name: sub.plan_name,
        tier: sub.plan_tier,
        type: sub.plan_type,
        max_students: sub.max_students,
        max_teachers: sub.max_instructors,
        max_batches: sub.max_batches,
        monthly_ai_credits: sub.monthly_ai_credits,
        show_branding: Boolean(sub.show_branding),
        feature_gates: featureGates,
        price: Number(sub.price),
        duration_days: sub.duration_days,
      } : null,
      subscription: sub ? {
        start_date: sub.start_date,
        end_date: sub.end_date,
        grace_end_date: sub.grace_end_date,
        payment_status: sub.payment_status,
        due_amount: Number(sub.price || 0),
        days_remaining: sub.end_date
          ? Math.max(0, Math.ceil((new Date(sub.end_date) - now) / (1000 * 60 * 60 * 24)))
          : 0,
      } : null,
      payments: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
      verified_at: now.toISOString(),
    });
  } catch (error) {
    console.error("[ERP Verify] Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
