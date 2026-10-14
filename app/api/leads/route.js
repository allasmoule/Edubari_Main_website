import { NextResponse } from "next/server";
import { query, queryOne, isUniqueViolation } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const data = await query("SELECT * FROM collected_leads ORDER BY created_at DESC");
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching collected leads:", err.message);
    return NextResponse.json({ error: "Failed to fetch collected leads" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase().slice(0, 255);

    if (!email || !EMAIL.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    try {
      const created = await queryOne("INSERT INTO collected_leads (id, email) VALUES (?, ?) RETURNING *", [
        crypto.randomUUID(),
        email,
      ]);
      return NextResponse.json(created);
    } catch (insertErr) {
      if (isUniqueViolation(insertErr)) {
        return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
      }
      throw insertErr;
    }
  } catch (err) {
    console.error("Error saving lead:", err.message);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
