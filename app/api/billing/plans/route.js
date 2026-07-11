import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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

    if (!plan_name || duration_days === undefined || max_students === undefined || max_instructors === undefined || price === undefined || !features) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const insertRow = {
      plan_name,
      duration_days: Number(duration_days),
      max_students: Number(max_students),
      max_instructors: Number(max_instructors),
      price: Number(price),
      features,
      plan_tier: plan_tier || "free",
      max_batches: max_batches !== undefined ? Number(max_batches) : 1,
      monthly_ai_credits: monthly_ai_credits !== undefined ? Number(monthly_ai_credits) : 0,
      show_branding: show_branding ?? true,
      is_active: is_active ?? true,
      sort_order: sort_order !== undefined ? Number(sort_order) : 0,
      feature_gates: feature_gates || {},
      old_price: old_price !== undefined && old_price !== null ? Number(old_price) : null,
      price_label: price_label || null,
      duration: duration || null,
      description: description || null,
      popular: popular ?? false,
      badge: badge || null
    };

    const { data, error } = await supabaseAdmin
      .from("plans")
      .insert(insertRow)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
