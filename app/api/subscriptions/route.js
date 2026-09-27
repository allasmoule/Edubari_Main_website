import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/subscriptions
 * List all subscription requests, newest first.
 */
export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const rows = await query("SELECT * FROM subscription_requests ORDER BY submitted_at DESC");
    return NextResponse.json(rows || []);
  } catch (error) {
    console.error("Error fetching subscriptions:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/subscriptions
 * Create a new subscription request (from the public pricing page).
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO subscription_requests
        (id, institution_name, full_name, email, phone, preferred_domain,
         address, payment_method, transaction_id, selected_plan_id,
         selected_plan_name, selected_plan_duration, selected_plan_price, verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        id,
        body.institutionName || null,
        body.fullName || null,
        body.email || null,
        body.phone || null,
        body.preferredDomain || null,
        body.address || null,
        body.paymentMethod || null,
        body.transactionId || null,
        body.selectedPlanId || null,
        body.selectedPlanName || null,
        body.selectedPlanDuration ? Number(body.selectedPlanDuration) : null,
        body.selectedPlanPrice ? Number(body.selectedPlanPrice) : null,
      ]
    );

    return NextResponse.json({ message: "Subscription created", subscriptionId: id }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
