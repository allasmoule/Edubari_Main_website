import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Helper to map DB row (snake_case) to Frontend model (camelCase & MongoDB compatibility)
function mapPlanFromDb(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    name: row.plan_name || row.name || "Default Plan",
    price: Number(row.price),
    oldPrice: row.old_price,
    priceLabel: row.price_label || `৳${Number(row.price).toLocaleString()}/${row.duration_days === 365 ? 'year' : 'month'}`,
    duration: row.duration_days === 365 ? 'Yearly' : row.duration_days === 30 ? 'Monthly' : `${row.duration_days} Days`,
    features: row.features || [],
    active: true,
    popular: row.duration_days === 365,
    badge: row.duration_days === 365 ? "25% OFF" : null
  };
}

// Helper to map Frontend payload (camelCase) to DB row (snake_case)
function mapPlanToDb(payload) {
  if (!payload) return null;
  const mapped = {};
  
  if (payload.name !== undefined) mapped.name = payload.name;
  if (payload.price !== undefined) mapped.price = Number(payload.price);
  if (payload.oldPrice !== undefined) mapped.old_price = payload.oldPrice ? Number(payload.oldPrice) : null;
  if (payload.priceLabel !== undefined) mapped.price_label = payload.priceLabel;
  if (payload.duration !== undefined) mapped.duration = payload.duration;
  if (payload.description !== undefined) mapped.description = payload.description;
  if (payload.features !== undefined) mapped.features = payload.features;
  if (payload.active !== undefined) mapped.active = payload.active;
  if (payload.popular !== undefined) mapped.popular = payload.popular;
  if (payload.badge !== undefined) mapped.badge = payload.badge;
  
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
