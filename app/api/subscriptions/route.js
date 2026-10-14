import { NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendOrderNotificationEmail } from "@/lib/email";

const HARDCODED_GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbw1mIEzNBLv6YLZpYwhewI5S7MITs1a8BYqId3QQhk30rn6VAN5sbYc8zOZ3cctoiJu/exec";

const text = (value, max) => {
  const v = value === undefined || value === null ? "" : String(value).trim();
  return v && v.toUpperCase() !== "N/A" ? v.slice(0, max) : null;
};

/**
 * GET /api/subscriptions — admin only: every order (names, phones, emails), newest first.
 */
export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const data = await query("SELECT * FROM subscription_requests ORDER BY submitted_at DESC");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/subscriptions
 * Create a new subscription request (from the public pricing page & checkout) & sync to Google Sheets.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const price = Number(body.selectedPlanPrice ?? body.price ?? 0);
    const mappedSubscription = {
      institution_name: text(body.institutionName || body.domain, 255) || "N/A",
      full_name: text(body.fullName || body.name, 255) || "N/A",
      email: text(body.email, 255) || "N/A",
      phone: text(body.phone, 50),
      preferred_domain: text(body.preferredDomain || body.domain, 255) || "N/A",
      address: text(body.address, 2000),
      payment_method: text(body.paymentMethod, 50) || "Direct Order (No Payment)",
      // The order forms send "N/A" when there is no payment; store NULL so the UNIQUE column
      // does not reject every order after the first one
      transaction_id: text(body.transactionId, 100),
      selected_plan_id: null,
      selected_plan_name: text(body.selectedPlanName || body.packageName, 255),
      // Forms send "Monthly" or "30 Days (5 AI Credits)"; keep the day count when there is one
      selected_plan_duration: Number.parseInt(String(body.selectedPlanDuration ?? ""), 10) || null,
      selected_plan_price: Number.isFinite(price) && price >= 0 ? price : 0,
      verified: false,
    };

    // Link the order to a plan only when it is a real plan (the AI checkout sends a package id)
    const planId = text(body.selectedPlanId || body.packageId, 36);
    if (planId) {
      const plan = await queryOne("SELECT id FROM plans WHERE id = ?", [planId]).catch(() => null);
      if (plan) mappedSubscription.selected_plan_id = plan.id;
    }

    // 1. Save to PostgreSQL (columns are fixed here — never taken from the request)
    let createdRecordId = null;
    try {
      const id = crypto.randomUUID();
      const m = mappedSubscription;
      await execute(
        `INSERT INTO subscription_requests
           (id, institution_name, full_name, email, phone, preferred_domain, address, payment_method, transaction_id,
            selected_plan_id, selected_plan_name, selected_plan_duration, selected_plan_price, verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, m.institution_name, m.full_name, m.email, m.phone, m.preferred_domain, m.address, m.payment_method,
          m.transaction_id, m.selected_plan_id, m.selected_plan_name, m.selected_plan_duration, m.selected_plan_price, m.verified]
      );
      createdRecordId = id;
    } catch (dbErr) {
      // Still forward the order to Google Sheets / email below, but make the failure visible
      console.error("Order could not be saved to the database:", dbErr.message);
    }

    // 2. Post to Google Sheets Web App Endpoint (Hardcoded Fallback guarantees 100% execution on production hosting)
    const googleSheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBAPP_URL || HARDCODED_GOOGLE_SHEET_URL;

    if (googleSheetUrl && googleSheetUrl.startsWith("http")) {
      try {
        const payload = {
          institutionName: body.institutionName || body.domain || "",
          fullName: body.fullName || body.name || body.userName || "",
          email: body.email || "",
          phone: body.phone || body.userPhone || "",
          preferredDomain: body.preferredDomain || body.domain || "",
          address: body.address || "",
          selectedPlanName: body.selectedPlanName || body.packageName || "",
          selectedPlanPrice: body.selectedPlanPrice || body.price || 0,
          selectedPlanDuration: body.selectedPlanDuration || "Direct Order"
        };
        
        const formDataEncoded = new URLSearchParams();
        Object.entries(payload).forEach(([key, value]) => {
          formDataEncoded.append(key, value);
        });
        formDataEncoded.append("data", JSON.stringify(payload));

        const sheetResponse = await fetch(googleSheetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formDataEncoded.toString(),
          redirect: "follow",
        });
        const sheetText = await sheetResponse.text();
        console.log("Google Apps Script response:", sheetText);
      } catch (gsErr) {
        console.error("Google Sheets WebApp fetch error:", gsErr);
      }
    }

    // 3. Send Email Notification to Admin & CC (+ confirmation to customer)
    sendOrderNotificationEmail({
      ...mappedSubscription,
      subscriptionId: createdRecordId || `SUB-${Date.now()}`
    }).catch((emailErr) => {
      console.error("Background order email send error:", emailErr);
    });

    return NextResponse.json({ 
      message: "Order submitted successfully", 
      subscriptionId: createdRecordId || "recorded" 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
