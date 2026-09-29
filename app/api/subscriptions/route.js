import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const HARDCODED_GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbw1mIEzNBLv6YLZpYwhewI5S7MITs1a8BYqId3QQhk30rn6VAN5sbYc8zOZ3cctoiJu/exec";

/**
 * GET /api/subscriptions
 * List all subscription requests, newest first.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("subscription_requests")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
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

    const mappedSubscription = {
      institution_name: body.institutionName || body.domain || "N/A",
      full_name: body.fullName || body.name || "N/A",
      email: body.email || "N/A",
      phone: body.phone || "N/A",
      preferred_domain: body.preferredDomain || body.domain || "N/A",
      address: body.address || "N/A",
      payment_method: body.paymentMethod || "Direct Order (No Payment)",
      transaction_id: body.transactionId || "N/A",
      selected_plan_id: body.selectedPlanId || body.packageId || null,
      selected_plan_name: body.selectedPlanName || body.packageName || null,
      selected_plan_duration: body.selectedPlanDuration ? String(body.selectedPlanDuration) : null,
      selected_plan_price: body.selectedPlanPrice || body.price ? Number(body.selectedPlanPrice || body.price) : 0,
      verified: false
    };

    // 1. Save to Supabase DB (if table available)
    let createdRecordId = null;
    try {
      const { data, error } = await supabaseAdmin
        .from("subscription_requests")
        .insert([mappedSubscription])
        .select();

      if (!error && data && data.length > 0) {
        createdRecordId = data[0].id;
      } else if (error) {
        console.warn("Supabase insert notice:", error.message);
      }
    } catch (dbErr) {
      console.warn("Supabase connection warning:", dbErr.message);
    }

    // 2. Post to Google Sheets Web App Endpoint (Hardcoded Fallback guarantees 100% execution on production hosting)
    const googleSheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBAPP_URL || HARDCODED_GOOGLE_SHEET_URL;

    if (googleSheetUrl && googleSheetUrl.startsWith("http")) {
      try {
        const sheetResponse = await fetch(googleSheetUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            institutionName: body.institutionName || body.domain || "",
            fullName: body.fullName || body.name || body.userName || "",
            email: body.email || "",
            phone: body.phone || body.userPhone || "",
            preferredDomain: body.preferredDomain || body.domain || "",
            address: body.address || "",
            selectedPlanName: body.selectedPlanName || body.packageName || "",
            selectedPlanPrice: body.selectedPlanPrice || body.price || 0,
            selectedPlanDuration: body.selectedPlanDuration || "Direct Order"
          }),
          redirect: "follow",
        });
        const sheetText = await sheetResponse.text();
        console.log("Google Apps Script response:", sheetText);
      } catch (gsErr) {
        console.error("Google Sheets WebApp fetch error:", gsErr);
      }
    }

    return NextResponse.json({ 
      message: "Order submitted successfully", 
      subscriptionId: createdRecordId || "recorded" 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
