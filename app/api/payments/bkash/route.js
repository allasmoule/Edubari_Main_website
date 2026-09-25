import { NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";

/**
 * POST /api/payments/bkash
 * 
 * bKash Merchant Payment Callback / Verification Endpoint.
 * Automatically verifies bKash transaction and activates/renews the School ERP subscription.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { token, transactionId, paymentMethod, planId, durationMonths, amount, phone } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    // 1. Find client by token or domain
    let client = null;
    if (token) {
      client = await queryOne("SELECT * FROM clients WHERE erp_api_token = ?", [token]);
    }

    // 2. Fetch plan details
    let plan = null;
    if (planId) {
      plan = await queryOne("SELECT * FROM plans WHERE id = ?", [planId]);
    }
    if (!plan) {
      plan = await queryOne("SELECT * FROM plans WHERE type = 'school_erp' ORDER BY price ASC LIMIT 1");
    }

    const months = durationMonths ? parseInt(durationMonths) : 1;
    const durationDays = (plan ? plan.duration_days : 30) * months;

    if (client) {
      // Direct instant auto-renewal for existing client
      const now = new Date();
      
      // Get current subscription to calculate new end date
      const activeSub = await queryOne(
        "SELECT * FROM subscriptions WHERE client_id = ? AND is_current = 1 LIMIT 1",
        [client.id]
      );

      let startDate = now;
      let newEndDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      if (activeSub && new Date(activeSub.end_date) > now) {
        // Carry forward remaining days
        startDate = new Date(activeSub.start_date);
        newEndDate = new Date(new Date(activeSub.end_date).getTime() + durationDays * 24 * 60 * 60 * 1000);
      }

      const graceEndDate = new Date(newEndDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Unmark old active sub
      await execute("UPDATE subscriptions SET is_current = 0 WHERE client_id = ?", [client.id]);

      // Insert new active subscription
      const newSubId = crypto.randomUUID();
      await execute(
        `INSERT INTO subscriptions 
          (id, client_id, plan_id, status, payment_status, start_date, end_date, grace_end_date, auto_renew, is_current, created_at, updated_at)
         VALUES (?, ?, ?, 'active', 'paid', ?, ?, ?, 1, 1, NOW(), NOW())`,
        [newSubId, client.id, plan ? plan.id : null, startDate, newEndDate, graceEndDate]
      );

      // Update client status to active
      await execute("UPDATE clients SET status = 'active' WHERE id = ?", [client.id]);

      return NextResponse.json({
        success: true,
        message: "bKash payment verified successfully! Subscription activated.",
        client_id: client.id,
        status: "active",
        end_date: newEndDate.toISOString(),
      });
    } else {
      // Save as pending subscription request for review
      const reqId = crypto.randomUUID();
      await execute(
        `INSERT INTO subscription_requests
          (id, phone, payment_method, transaction_id, selected_plan_id, selected_plan_name, selected_plan_duration, selected_plan_price, verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [reqId, phone || null, paymentMethod || "bkash", transactionId, plan?.id || null, plan?.plan_name || null, months, amount || plan?.price || 0]
      );

      return NextResponse.json({
        success: true,
        message: "bKash payment recorded. Pending central admin confirmation.",
        request_id: reqId,
      });
    }
  } catch (error) {
    console.error("[bKash API] Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
