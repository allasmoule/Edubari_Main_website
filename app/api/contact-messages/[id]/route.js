import { NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { asBool } from "@/lib/crud";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    const setClauses = [];
    const values = [];

    if (body.read !== undefined) {
      setClauses.push("read = ?");
      values.push(asBool(body.read));
    }
    if (body.response !== undefined) {
      setClauses.push("response = ?", "replied_at = NOW()");
      values.push(body.response === null ? null : String(body.response).slice(0, 10000));
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const updated = await queryOne(`UPDATE contact_messages SET ${setClauses.join(", ")} WHERE id = ? RETURNING *`, values);
    if (!updated) return NextResponse.json({ error: "Message not found" }, { status: 404 });

    return NextResponse.json({ message: "Message updated", contactMessage: updated });
  } catch (error) {
    console.error("Error updating message:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    await execute("DELETE FROM contact_messages WHERE id = ?", [id]);
    return NextResponse.json({ message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
