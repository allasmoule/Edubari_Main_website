import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      plan_name, 
      duration_days, 
      max_students, 
      max_instructors, 
      price, 
      features,
      plan_tier,
      max_batches,
      monthly_ai_credits,
      show_branding,
      is_active,
      sort_order,
      feature_gates,
      old_price,
      price_label,
      duration,
      description,
      popular,
      badge
    } = body;

    const updates = {};
    if (plan_name !== undefined) updates.plan_name = plan_name;
    if (duration_days !== undefined) updates.duration_days = Number(duration_days);
    if (max_students !== undefined) updates.max_students = Number(max_students);
    if (max_instructors !== undefined) updates.max_instructors = Number(max_instructors);
    if (price !== undefined) updates.price = Number(price);
    if (features !== undefined) updates.features = features;
    if (plan_tier !== undefined) updates.plan_tier = plan_tier;
    if (max_batches !== undefined) updates.max_batches = Number(max_batches);
    if (monthly_ai_credits !== undefined) updates.monthly_ai_credits = Number(monthly_ai_credits);
    if (show_branding !== undefined) updates.show_branding = show_branding;
    if (is_active !== undefined) updates.is_active = is_active;
    if (sort_order !== undefined) updates.sort_order = Number(sort_order);
    if (feature_gates !== undefined) updates.feature_gates = feature_gates;
    if (old_price !== undefined) updates.old_price = old_price !== null ? Number(old_price) : null;
    if (price_label !== undefined) updates.price_label = price_label;
    if (duration !== undefined) updates.duration = duration;
    if (description !== undefined) updates.description = description;
    if (popular !== undefined) updates.popular = popular;
    if (badge !== undefined) updates.badge = badge;

    const { data, error } = await supabaseAdmin
      .from("plans")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("plans")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "23503") {
        return NextResponse.json({
          error: "This plan cannot be deleted because active client subscriptions reference it. Please suspend subscriptions or change their plan first."
        }, { status: 400 });
      }
      throw error;
    }
    return NextResponse.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
