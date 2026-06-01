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
  return {
    name: payload.name,
    price: Number(payload.price),
    old_price: payload.oldPrice ? Number(payload.oldPrice) : null,
    price_label: payload.priceLabel || `৳${Number(payload.price).toLocaleString()}/${(payload.duration || "month").toLowerCase()}`,
    duration: payload.duration,
    description: payload.description || "",
    features: payload.features || [],
    active: payload.active ?? true,
    popular: payload.popular ?? false,
    badge: payload.badge || null,
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
