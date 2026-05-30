import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if this is an approval request
    const isApprove = (body.verified === true || body.adminStatus === "reviewed");
    
    if (isApprove) {
      // 1. Fetch the subscription request from subscription_requests table
      const { data: reqData, error: reqErr } = await supabaseAdmin
        .from("subscription_requests")
        .select("*")
        .eq("id", id)
        .single();
        
      if (reqErr || !reqData) {
        return NextResponse.json({ error: "Subscription request not found" }, { status: 404 });
      }
      
      // If already verified, just update the request flag and return to prevent duplicates
      if (reqData.verified) {
        const { data, error } = await supabaseAdmin
          .from("subscription_requests")
          .update({ verified: true })
          .eq("id", id)
          .select();
          
        if (error) throw error;
        
        const mapped = {
          ...data[0],
          _id: data[0].id,
          adminStatus: "reviewed"
        };
        return NextResponse.json({ message: "Subscription request already verified", subscription: mapped });
      }
      
      // 2. Fetch Selected Plan details to calculate dates
      const { data: plan, error: planError } = await supabaseAdmin
        .from("plans")
        .select("*")
        .eq("id", reqData.selected_plan_id)
        .single();
        
      if (planError || !plan) {
        return NextResponse.json({ error: `Associated plan ${reqData.selected_plan_name || reqData.selected_plan_id} not found.` }, { status: 404 });
      }
      
      const domain = reqData.preferred_domain.trim().toLowerCase();
      
      // 3. Check if Client with this domain already exists
      const { data: existingClient, error: clientErr } = await supabaseAdmin
        .from("clients")
        .select("*")
        .eq("domain", domain)
        .maybeSingle();
        
      if (clientErr) throw clientErr;
      
      let clientId = null;
      let start = new Date();
      let durationDays = plan.duration_days;
      let activeSubToRestore = null;
      
      if (existingClient) {
        // --- RENEWAL / EXTENSION FLOW ---
        clientId = existingClient.id;
        
        // Check if there is an active subscription for this client to carry over remaining days
        const { data: activeSub, error: subErr } = await supabaseAdmin
          .from("subscriptions")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_current", true)
          .maybeSingle();
          
        if (!subErr && activeSub) {
          activeSubToRestore = activeSub;
          const activeEnd = new Date(activeSub.end_date);
          const now = new Date();
          if (now < activeEnd) {
            // Calculate remaining days and add them to the new plan duration
            const remainingMs = activeEnd.getTime() - now.getTime();
            const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
            durationDays += remainingDays;
          }
        }
        
        // Deactivate all older subscriptions for this client
        const { error: deactivateErr } = await supabaseAdmin
          .from("subscriptions")
          .update({ is_current: false })
          .eq("client_id", clientId);
          
        if (deactivateErr) throw deactivateErr;
        
        // Ensure the client's status is "active" (in case they were suspended)
        const { error: activateClientErr } = await supabaseAdmin
          .from("clients")
          .update({ status: "active" })
          .eq("id", clientId);
          
        if (activateClientErr) {
          if (activeSubToRestore) {
            await supabaseAdmin
              .from("subscriptions")
              .update({ is_current: true })
              .eq("id", activeSubToRestore.id);
          }
          throw activateClientErr;
        }
      } else {
        // --- NEW CLIENT REGISTRATION FLOW ---
        const { data: newClient, error: newClientErr } = await supabaseAdmin
          .from("clients")
          .insert({
            client_name: reqData.institution_name,
            domain: domain,
            phone: reqData.phone,
            status: "active",
            logo_url: null
          })
          .select()
          .single();
          
        if (newClientErr) throw newClientErr;
        clientId = newClient.id;
      }
      
      // 4. Calculate Dates for the Subscription
      const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const grace = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000); // 7-day grace period
      
      // 5. Create the Active Subscription
      const { error: subInsertErr } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          client_id: clientId,
          plan_id: plan.id,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          grace_end_date: grace.toISOString(),
          is_current: true,
          payment_status: "paid"
        });
        
      if (subInsertErr) {
        // Cleanup or Rollback
        if (!existingClient && clientId) {
          await supabaseAdmin.from("clients").delete().eq("id", clientId);
        } else if (existingClient && activeSubToRestore) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ is_current: true })
            .eq("id", activeSubToRestore.id);
        }
        throw subInsertErr;
      }
    }
    
    // 6. Perform the actual verification update in subscription_requests table
    const updates = {};
    if (body.verified !== undefined) {
      updates.verified = body.verified;
    } else if (body.adminStatus === "reviewed") {
      updates.verified = true;
    }

    const { data, error } = await supabaseAdmin
      .from("subscription_requests")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return NextResponse.json({ error: "Subscription request not found" }, { status: 404 });
    }

    const mapped = {
      ...data[0],
      _id: data[0].id,
      adminStatus: data[0].verified ? "reviewed" : "pending"
    };

    return NextResponse.json({ message: "Subscription approved and activated successfully", subscription: mapped });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Subscription deleted" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    const mapped = {
      ...data,
      _id: data.id,
      adminStatus: data.verified ? "reviewed" : "pending"
    };

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
