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
 * Create a new subscription request (from the public pricing page) & sync to Google Sheets.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const id = crypto.randomUUID();
    
    // 1. Save to DB if MySQL db configured
    try {
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
          body.paymentMethod || "Direct Order (No Payment)",
          body.transactionId || "N/A",
          body.selectedPlanId || null,
          body.selectedPlanName || null,
          body.selectedPlanDuration ? String(body.selectedPlanDuration) : null,
          body.selectedPlanPrice ? Number(body.selectedPlanPrice) : 0,
        ]
      );
    } catch (dbErr) {
      console.warn("DB insert notice:", dbErr.message);
    }

    // 2. Post to Google Sheets Web App Endpoint
    const googleSheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBAPP_URL;

    if (googleSheetUrl && googleSheetUrl.startsWith("http")) {
      try {
        const sheetResponse = await fetch(googleSheetUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(body),
          redirect: "follow",
        });
        const sheetText = await sheetResponse.text();
        console.log("Google Apps Script response:", sheetText);
      } catch (gsErr) {
        console.error("Google Sheets WebApp fetch error:", gsErr);
      }
    }

    return NextResponse.json({ message: "Order submitted successfully", subscriptionId: id }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
