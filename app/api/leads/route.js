import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("collected_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Error fetching collected leads:", err);
    return NextResponse.json(
      { error: "Failed to fetch collected leads" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("collected_leads")
      .insert([{ email }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: "Email is already registered" },
          { status: 400 }
        );
      }
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error saving lead:", err);
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 }
    );
  }
}
