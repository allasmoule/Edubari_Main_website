import { NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { TEAM_MEMBER_FIELDS, pickFields, updateRow } from "@/lib/crud";

export async function PATCH(request, context) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    const fields = pickFields(await request.json(), TEAM_MEMBER_FIELDS);

    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    if (fields.name === null || fields.name === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updated = await updateRow("team_members", id, fields);
    if (!updated) return NextResponse.json({ error: "Record not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Unexpected PATCH team_members Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    await execute("DELETE FROM team_members WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected DELETE team_members Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
