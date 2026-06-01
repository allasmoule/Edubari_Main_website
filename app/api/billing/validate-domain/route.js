import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain")?.trim();

    if (!domain) {
      return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 });
    }

    // 1. Fetch Client by Domain
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("domain", domain)
      .maybeSingle();

    if (clientError) throw clientError;

    if (!client) {
      return NextResponse.json({
        registered: false,
        status: "unregistered",
        active: false,
        message: "This domain is not registered on the Edubari platform."
      });
    }

    // 2. Check client suspension status
    if (client.status === "suspended") {
      return NextResponse.json({
        registered: true,
        status: "suspended",
        active: false,
        client_name: client.client_name,
        domain: client.domain,
        message: "Your Edubari instance subscription is suspended. Please contact support."
      });
    }

    // 3. Fetch current active subscription
    const { data: sub, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        *,
        plans (*)
      `)
      .eq("client_id", client.id)
      .eq("is_current", true)
      .maybeSingle();

    if (subError) throw subError;

    if (!sub) {
      return NextResponse.json({
        registered: true,
        status: "no_subscription",
        active: false,
        client_name: client.client_name,
        domain: client.domain,
        message: "No current active subscription found for this client."
      });
    }

    const now = new Date();
    const endDate = new Date(sub.end_date);
    const graceEndDate = new Date(sub.grace_end_date);
    const plan = sub.plans;

    const payload = {
      registered: true,
      client_name: client.client_name,
      domain: client.domain,
      subscription_id: sub.id,
      plan_name: plan?.plan_name || "Unknown Plan",
      max_students: plan?.max_students || 0,
      max_instructors: plan?.max_instructors || 0,
      features: plan?.features || [],
      end_date: sub.end_date,
      grace_end_date: sub.grace_end_date,
      payment_status: sub.payment_status
    };

    // 4. Verify dates
    if (now < endDate) {
      return NextResponse.json({
        ...payload,
        status: "active",
        active: true
      });
    } else if (now >= endDate && now < graceEndDate) {
      return NextResponse.json({
        ...payload,
        status: "grace_period",
        active: true,
        warning: "Subscription has expired but is active under the grace period.",
        grace_days_remaining: Math.max(0, Math.ceil((graceEndDate - now) / (1000 * 60 * 60 * 24)))
      });
    } else {
      return NextResponse.json({
        ...payload,
        status: "expired",
        active: false,
        message: "Subscription has expired and the grace period has ended. Please renew."
      });
    }

  } catch (error) {
    console.error("Error validating domain subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
