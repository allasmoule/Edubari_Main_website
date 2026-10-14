import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { TEAM_MEMBER_FIELDS, insertRow, pickFields } from "@/lib/crud";

export async function GET() {
  try {
    const data = await query("SELECT * FROM team_members ORDER BY order_index ASC, created_at ASC");
    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected GET team_members Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const fields = pickFields(await request.json(), TEAM_MEMBER_FIELDS);
    if (!fields.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const created = await insertRow("team_members", { id: crypto.randomUUID(), ...fields });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Unexpected POST team_members Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
