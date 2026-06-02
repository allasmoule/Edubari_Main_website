import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { start_date, end_date, grace_end_date, is_current, payment_status } = body;

    const updates = {};
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (grace_end_date !== undefined) updates.grace_end_date = grace_end_date;
    if (is_current !== undefined) updates.is_current = is_current;
    if (payment_status !== undefined) updates.payment_status = payment_status;

    // 1. If updating is_current to true, we must deactivate all other subscriptions for the same client first
    if (is_current === true) {
      // Get the client_id for this subscription first
      const { data: currentSub, error: fetchError } = await supabaseAdmin
        .from("subscriptions")
        .select("client_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update({ is_current: false })
        .eq("client_id", currentSub.client_id);

      if (updateError) throw updateError;
    }

    // 2. Perform the update
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        clients (*),
        plans (*)
      `)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
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
    return NextResponse.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
