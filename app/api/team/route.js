import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("GET team_members Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected GET team_members Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, image_url, order_index, active } = body;

    const { data, error } = await supabase
      .from("team_members")
      .insert([
        {
          name,
          description,
          image_url,
          order_index: order_index || 1,
          active: active !== undefined ? active : true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("POST team_members Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Unexpected POST team_members Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
