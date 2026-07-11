import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Helper to map DB row (snake_case) to Frontend model (camelCase & MongoDB compatibility)
function mapPlanFromDb(row) {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    _id: row.id,
    name: row.plan_name || "Default Plan",
    plan_name: row.plan_name,
    durationDays: row.duration_days || 30,
    duration_days: row.duration_days || 30,
    maxStudents: row.max_students || 200,
    max_students: row.max_students || 200,
    maxInstructors: row.max_instructors || 10,
    max_instructors: row.max_instructors || 10,
    maxBatches: row.max_batches || 1,
    max_batches: row.max_batches || 1,
    monthlyAiCredits: row.monthly_ai_credits || 0,
    monthly_ai_credits: row.monthly_ai_credits || 0,
    showBranding: row.show_branding ?? true,
    show_branding: row.show_branding ?? true,
    active: row.is_active ?? true,
    is_active: row.is_active ?? true,
    sortOrder: row.sort_order || 0,
    sort_order: row.sort_order || 0,
    featureGates: row.feature_gates || {},
    feature_gates: row.feature_gates || {},
    price: Number(row.price),
    oldPrice: row.old_price,
    priceLabel: row.price_label || `৳${Number(row.price).toLocaleString()}/${row.duration_days === 365 ? 'year' : 'month'}`,
    duration: row.duration || (row.duration_days === 365 ? 'Yearly' : row.duration_days === 30 ? 'Monthly' : `${row.duration_days} Days`),
    features: row.features || [],
    popular: row.popular || false,
    badge: row.badge || null,
    planTier: row.plan_tier || 'free',
    plan_tier: row.plan_tier || 'free',
  };
}

// Helper to map Frontend payload (camelCase) to DB row (snake_case)
function mapPlanToDb(payload) {
  if (!payload) return null;
  const mapped = {};
  
  if (payload.name !== undefined) mapped.plan_name = payload.name;
  if (payload.plan_name !== undefined) mapped.plan_name = payload.plan_name;
  if (payload.price !== undefined) mapped.price = Number(payload.price);
  if (payload.oldPrice !== undefined) mapped.old_price = payload.oldPrice ? Number(payload.oldPrice) : null;
  if (payload.old_price !== undefined) mapped.old_price = payload.old_price ? Number(payload.old_price) : null;
  if (payload.priceLabel !== undefined) mapped.price_label = payload.priceLabel;
  if (payload.price_label !== undefined) mapped.price_label = payload.price_label;
  if (payload.duration !== undefined) mapped.duration = payload.duration;
  if (payload.description !== undefined) mapped.description = payload.description;
  if (payload.features !== undefined) mapped.features = payload.features;
  if (payload.active !== undefined) mapped.is_active = payload.active;
  if (payload.is_active !== undefined) mapped.is_active = payload.is_active;
  if (payload.popular !== undefined) mapped.popular = payload.popular;
  if (payload.badge !== undefined) mapped.badge = payload.badge;
  if (payload.planTier !== undefined) mapped.plan_tier = payload.planTier;
  if (payload.plan_tier !== undefined) mapped.plan_tier = payload.plan_tier;
  if (payload.maxStudents !== undefined) mapped.max_students = Number(payload.maxStudents);
  if (payload.max_students !== undefined) mapped.max_students = Number(payload.max_students);
  if (payload.maxInstructors !== undefined) mapped.max_instructors = Number(payload.maxInstructors);
  if (payload.max_instructors !== undefined) mapped.max_instructors = Number(payload.max_instructors);
  if (payload.maxBatches !== undefined) mapped.max_batches = Number(payload.maxBatches);
  if (payload.max_batches !== undefined) mapped.max_batches = Number(payload.max_batches);
  if (payload.monthlyAiCredits !== undefined) mapped.monthly_ai_credits = Number(payload.monthlyAiCredits);
  if (payload.monthly_ai_credits !== undefined) mapped.monthly_ai_credits = Number(payload.monthly_ai_credits);
  if (payload.showBranding !== undefined) mapped.show_branding = payload.showBranding;
  if (payload.show_branding !== undefined) mapped.show_branding = payload.show_branding;
  if (payload.sortOrder !== undefined) mapped.sort_order = Number(payload.sortOrder);
  if (payload.sort_order !== undefined) mapped.sort_order = Number(payload.sort_order);
  if (payload.featureGates !== undefined) mapped.feature_gates = payload.featureGates;
  if (payload.feature_gates !== undefined) mapped.feature_gates = payload.feature_gates;
  if (payload.durationDays !== undefined) mapped.duration_days = Number(payload.durationDays);
  if (payload.duration_days !== undefined) mapped.duration_days = Number(payload.duration_days);
  
  return mapped;
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const dbUpdates = mapPlanToDb(body);

    const { data, error } = await supabaseAdmin
      .from("plans")
      .update(dbUpdates)
      .eq("id", id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Plan updated", plan: mapPlanFromDb(data[0]) });
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

    if (error) throw error;

    return NextResponse.json({ message: "Plan deleted" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
