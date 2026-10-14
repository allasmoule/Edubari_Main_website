import { NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { BANNER_FIELDS, pickFields, updateRow } from "@/lib/crud";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const fields = pickFields(body, BANNER_FIELDS);
    if (fields.image === null || fields.image === "") {
      return NextResponse.json({ error: "Banner image is required" }, { status: 400 });
    }
    const updated = await updateRow("banners", id, fields);
    if (!updated) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating banner:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const { rowCount } = await execute("DELETE FROM banners WHERE id = ?", [id]);
    if (!rowCount) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banner:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
