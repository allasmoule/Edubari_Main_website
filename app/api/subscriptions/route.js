import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("subscription_requests")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Map payload to PostgreSQL fields
    const mappedSubscription = {
      institution_name: body.institutionName,
      full_name: body.fullName,
      email: body.email,
      phone: body.phone,
      preferred_domain: body.preferredDomain,
      address: body.address,
      payment_method: body.paymentMethod || "Direct Order (No Payment)",
      transaction_id: body.transactionId || "N/A",
      selected_plan_id: body.selectedPlanId || null,
      selected_plan_name: body.selectedPlanName || null,
      selected_plan_duration: body.selectedPlanDuration || null,
      selected_plan_price: body.selectedPlanPrice || null,
      verified: false
    };

    // 1. Try DB Insert (Supabase)
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

    return NextResponse.json({ 
      message: "Order submitted successfully", 
      subscriptionId: createdRecordId || "recorded" 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
