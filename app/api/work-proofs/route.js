import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdmin, requireAdmin } from "@/lib/auth";
import { WORK_PROOF_ALIASES, WORK_PROOF_FIELDS, insertRow, normalizeKeys, pickFields } from "@/lib/crud";

/** Public: active work proofs. A signed-in admin also sees the hidden ones. */
export async function GET(request) {
  try {
    const admin = await getAdmin(request);
    const data = await query(
      `SELECT * FROM work_proofs ${admin ? "" : "WHERE active"} ORDER BY order_index ASC, created_at ASC`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.warn("Error fetching work proofs:", error?.message);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const body = normalizeKeys(await request.json(), WORK_PROOF_ALIASES);
    const fields = pickFields(body, WORK_PROOF_FIELDS);
    if (!fields.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const created = await insertRow("work_proofs", { id: crypto.randomUUID(), ...fields });
    return NextResponse.json({ ...created, message: "Work proof created", workProofId: created.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating work proof:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
