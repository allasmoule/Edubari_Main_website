import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    
    // Create an object with only defined keys
    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.order_index !== undefined) updateData.order_index = body.order_index;
    if (body.active !== undefined) updateData.active = body.active;

    const { data, error } = await supabase
      .from("team_members")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PATCH team_members Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected PATCH team_members Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE team_members Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected DELETE team_members Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
