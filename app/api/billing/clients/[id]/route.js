import { NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { client_name, domain, status, phone, logo_url } = body;

    const existing = await queryOne("SELECT * FROM clients WHERE id = ?", [id]);
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const updates = [];
    const values = [];

    if (client_name !== undefined) {
      updates.push("client_name = ?");
      values.push(client_name);
    }
    if (domain !== undefined) {
      updates.push("domain = ?");
      values.push(domain);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (logo_url !== undefined) {
      updates.push("logo_url = ?");
      values.push(logo_url);
    }

    if (updates.length > 0) {
      values.push(id);
      await execute(
        `UPDATE clients SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
    }

    const updated = await queryOne("SELECT * FROM clients WHERE id = ?", [id]);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating client:", error.message);
    if (error.message && error.message.includes("ER_DUP_ENTRY")) {
      return NextResponse.json({ error: "Domain already registered" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;

    // Delete associated subscriptions first to maintain integrity
    await execute("DELETE FROM subscriptions WHERE client_id = ?", [id]);
    await execute("DELETE FROM clients WHERE id = ?", [id]);

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

