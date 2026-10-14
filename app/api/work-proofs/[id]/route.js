import { NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { WORK_PROOF_ALIASES, WORK_PROOF_FIELDS, normalizeKeys, pickFields, updateRow } from "@/lib/crud";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const fields = pickFields(normalizeKeys(await request.json(), WORK_PROOF_ALIASES), WORK_PROOF_FIELDS);
    if (fields.title === null || fields.title === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const updated = await updateRow("work_proofs", id, fields);
    if (!updated) return NextResponse.json({ error: "Work proof not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating work proof:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const { rowCount } = await execute("DELETE FROM work_proofs WHERE id = ?", [id]);
    if (!rowCount) return NextResponse.json({ error: "Work proof not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting work proof:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
