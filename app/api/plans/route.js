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
  return {
    plan_name: payload.name || payload.plan_name,
    duration_days: payload.durationDays !== undefined ? Number(payload.durationDays) : (payload.duration_days !== undefined ? Number(payload.duration_days) : 30),
    max_students: payload.maxStudents !== undefined ? Number(payload.maxStudents) : (payload.max_students !== undefined ? Number(payload.max_students) : 200),
    max_instructors: payload.maxInstructors !== undefined ? Number(payload.maxInstructors) : (payload.max_instructors !== undefined ? Number(payload.max_instructors) : 10),
    price: Number(payload.price),
    old_price: payload.oldPrice ? Number(payload.oldPrice) : (payload.old_price ? Number(payload.old_price) : null),
    price_label: payload.priceLabel || payload.price_label || `৳${Number(payload.price).toLocaleString()}/month`,
    duration: payload.duration || null,
    description: payload.description || "",
    features: payload.features || [],
    is_active: payload.active ?? payload.is_active ?? true,
    popular: payload.popular ?? false,
    badge: payload.badge || null,
    plan_tier: payload.planTier || payload.plan_tier || 'free',
    max_batches: payload.maxBatches !== undefined ? Number(payload.maxBatches) : (payload.max_batches !== undefined ? Number(payload.max_batches) : 1),
    monthly_ai_credits: payload.monthlyAiCredits !== undefined ? Number(payload.monthlyAiCredits) : (payload.monthly_ai_credits !== undefined ? Number(payload.monthly_ai_credits) : 0),
    show_branding: payload.showBranding ?? payload.show_branding ?? true,
    sort_order: payload.sortOrder !== undefined ? Number(payload.sortOrder) : (payload.sort_order !== undefined ? Number(payload.sort_order) : 0),
    feature_gates: payload.featureGates || payload.feature_gates || {},
  };
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) throw error;
    
    const mappedPlans = data.map(mapPlanFromDb);
    return NextResponse.json(mappedPlans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const dbRow = mapPlanToDb(body);

    const { data, error } = await supabaseAdmin
      .from("plans")
      .insert([dbRow])
      .select();

    if (error) throw error;
    
    return NextResponse.json(mapPlanFromDb(data[0]), { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  // We can add single resource updates if called, wait! The legacy dashboard updates plans at /plans/:id.
  // Next.js Route Handlers support dynamic routing. Let's support dynamic PATCH/DELETE inside dynamic routes!
  return NextResponse.json({ error: "Method not allowed. Use dynamic /api/plans/[id] endpoint." }, { status: 405 });
}
