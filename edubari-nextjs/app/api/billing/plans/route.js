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
    const { plan_name, duration_days, max_students, max_instructors, price, features } = body;

    if (!plan_name || duration_days === undefined || max_students === undefined || max_instructors === undefined || price === undefined || !features) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("plans")
      .insert({
        plan_name,
        duration_days: Number(duration_days),
        max_students: Number(max_students),
        max_instructors: Number(max_instructors),
        price: Number(price),
        features
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
