import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdmin, requireAdmin } from "@/lib/auth";
import { BANNER_FIELDS, insertRow, pickFields } from "@/lib/crud";

/** Public: active banners. A signed-in admin also sees the hidden ones (to switch them back on). */
export async function GET(request) {
  try {
    const admin = await getAdmin(request);
    const data = await query(
      `SELECT * FROM banners ${admin ? "" : "WHERE active"} ORDER BY order_index ASC, created_at ASC`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching banners:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const fields = pickFields(body, BANNER_FIELDS);
    if (!fields.image) {
      return NextResponse.json({ error: "Banner image is required" }, { status: 400 });
    }
    const created = await insertRow("banners", { id: crypto.randomUUID(), ...fields });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
