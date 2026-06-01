import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { client_name, domain, status, phone, logo_url } = body;

    const updates = {};
    if (client_name !== undefined) updates.client_name = client_name;
    if (domain !== undefined) updates.domain = domain;
    if (status !== undefined) updates.status = status;
    if (phone !== undefined) updates.phone = phone;
    if (logo_url !== undefined) updates.logo_url = logo_url;

    const { data, error } = await supabaseAdmin
      .from("clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Domain already registered" }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("clients")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
