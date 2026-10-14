import { NextResponse } from "next/server";
import { queryOne, execute, withTransaction, isUniqueViolation, isCheckViolation } from "@/lib/db";
import { cleanDomain } from "@/lib/safe-redirect";
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
      const cleaned = cleanDomain(domain);
      if (!cleaned) return NextResponse.json({ error: "Enter a valid domain" }, { status: 400 });
      updates.push("domain = ?");
      values.push(cleaned);
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

    const updated = await withTransaction(async (tx) => {
      if (updates.length === 0) return tx.queryOne("SELECT * FROM clients WHERE id = ?", [id]);
      values.push(id);
      const row = await tx.queryOne(`UPDATE clients SET ${updates.join(", ")} WHERE id = ? RETURNING *`, values);
      // The ERP connection row keeps its own copy of the domain
      if (domain !== undefined) {
        await tx.execute("UPDATE erp_connections SET domain = ? WHERE client_id = ?", [row.domain, id]);
      }
      return row;
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "Domain already registered" }, { status: 400 });
    }
    if (isCheckViolation(error)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    console.error("Error updating client:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;

    // Subscriptions, payments and the ERP connection are removed with it (ON DELETE CASCADE)
    await execute("DELETE FROM clients WHERE id = ?", [id]);

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

