import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select(`
        *,
        subscriptions (
          *,
          plans (*)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { client_name, domain, status, phone, plan_id, logo_url } = body;

    if (!client_name || !domain || !status || !plan_id) {
      return NextResponse.json({ error: "Client name, domain binding, status, and subscription plan are required" }, { status: 400 });
    }

    // 1. Fetch Selected Plan details to calculate dates
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Selected pricing plan not found" }, { status: 404 });
    }

    // 2. Create the Client
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .insert({ client_name, domain, status, phone, logo_url })
      .select()
      .single();

    if (clientError) {
      if (clientError.code === "23505") {
        return NextResponse.json({ error: "Domain already registered" }, { status: 400 });
      }
      throw clientError;
    }

    // 3. Calculate Dates for the Subscription
    const start = new Date();
    const end = new Date(start.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);
    const grace = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000); // 7-day grace period

    // 4. Create the Active Subscription
    const { error: subError } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        client_id: client.id,
        plan_id: plan.id,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        grace_end_date: grace.toISOString(),
        is_current: true,
        payment_status: "paid"
      });

    if (subError) {
      // Roll back client insertion on subscription failure
      await supabaseAdmin.from("clients").delete().eq("id", client.id);
      throw subError;
    }

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client with plan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
