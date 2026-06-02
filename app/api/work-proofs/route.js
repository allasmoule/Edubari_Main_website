import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("work_proofs")
      .select("*")
      .eq("active", true)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching work proofs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const mappedProof = {
      title: body.title,
      description: body.description || null,
      image_url: body.image_url || body.imageUrl || null,
      client_name: body.client_name || body.clientName || null,
      project_url: body.project_url || body.projectUrl || null,
      order_index: Number(body.order_index || body.orderIndex || 1),
      active: typeof body.active === "boolean" ? body.active : true
    };

    const { data, error } = await supabaseAdmin
      .from("work_proofs")
      .insert([mappedProof])
      .select();

    if (error) throw error;
    return NextResponse.json({ message: "Work proof created", workProofId: data[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error creating work proof:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
