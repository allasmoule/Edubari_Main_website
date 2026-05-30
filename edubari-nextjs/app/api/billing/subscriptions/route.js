import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        *,
        clients (*),
        plans (*)
      `)
      .order("created_at", { ascending: false });

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
    const { client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status } = body;

    if (!client_id || !plan_id || !payment_status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch the plan duration to calculate dates if they are missing
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("duration_days")
      .eq("id", plan_id)
      .single();

    if (planError) throw planError;

    const start = start_date ? new Date(start_date) : new Date();
    
    let end;
    if (end_date) {
      end = new Date(end_date);
    } else {
      end = new Date(start.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);
    }

    let grace;
    if (grace_end_date) {
      grace = new Date(grace_end_date);
    } else {
      // Default to 7 days grace period
      grace = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const currentActive = is_current !== undefined ? is_current : true;

    // 2. If this is going to be the current active subscription, disable all other subscriptions for this client
    if (currentActive) {
      const { error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update({ is_current: false })
        .eq("client_id", client_id);

      if (updateError) throw updateError;
    }

    // 3. Create the subscription
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        client_id,
        plan_id,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        grace_end_date: grace.toISOString(),
        is_current: currentActive,
        payment_status
      })
      .select(`
        *,
        clients (*),
        plans (*)
      `)
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
