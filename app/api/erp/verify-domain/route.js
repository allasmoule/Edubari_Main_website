import { NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";

/**
 * GET /api/erp/verify-domain?token=xxx&secret=yyy
 *
 * Called by Laravel School ERP on boot and periodically.
 * Returns subscription status + plan limits for the domain.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const secret = searchParams.get("secret");

    if (!token) {
      return NextResponse.json({ error: "Missing API token" }, { status: 401 });
    }

    // Find client by ERP token
    const client = await queryOne(
      "SELECT * FROM clients WHERE erp_api_token = ?",
      [token]
    );

    if (!client) {
      return NextResponse.json({ error: "Invalid API token. No matching ERP instance found." }, { status: 403 });
    }

    // Optional secret validation
    if (secret && client.erp_secret !== secret) {
      return NextResponse.json({ error: "Invalid API secret." }, { status: 403 });
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

    return NextResponse.json({
      active: isActive,
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
        days_remaining: sub.end_date
          ? Math.max(0, Math.ceil((new Date(sub.end_date) - now) / (1000 * 60 * 60 * 24)))
          : 0,
      } : null,
      verified_at: now.toISOString(),
    });
  } catch (error) {
    console.error("[ERP Verify] Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
