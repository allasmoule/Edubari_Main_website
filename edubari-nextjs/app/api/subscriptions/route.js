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
    
    // Map payload from original frontend to PostgreSQL fields
    const mappedSubscription = {
      institution_name: body.institutionName,
      full_name: body.fullName,
      email: body.email,
      phone: body.phone,
      preferred_domain: body.preferredDomain,
      address: body.address,
      payment_method: body.paymentMethod,
      transaction_id: body.transactionId,
      selected_plan_id: body.selectedPlanId || null,
      selected_plan_name: body.selectedPlanName || null,
      selected_plan_duration: body.selectedPlanDuration || null,
      selected_plan_price: body.selectedPlanPrice || null,
      verified: false
    };

    const { data, error } = await supabaseAdmin
      .from("subscription_requests")
      .insert([mappedSubscription])
      .select();

    if (error) throw error;
    return NextResponse.json({ message: "Subscription created", subscriptionId: data[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
