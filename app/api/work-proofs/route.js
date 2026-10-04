import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const timeoutPromise = new Promise((resolve) =>
    setTimeout(() => resolve({ data: [] }), 1500)
  );

  try {
    const fetchPromise = supabaseAdmin
      .from("work_proofs")
      .select("*")
      .eq("active", true)
      .order("order_index", { ascending: true });
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    const data = res?.data || [];

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" },
    });
  } catch (error) {
    console.error("Error fetching work proofs:", error);
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" },
    });
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

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
