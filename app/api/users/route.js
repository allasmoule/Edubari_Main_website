import { NextResponse } from "next/server";
import crypto from "crypto";
import { queryOne, execute, isUniqueViolation } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";

/**
 * POST /api/users — a signed-in admin creates another admin account.
 * (Only admins can sign in to this website; there are no other user types.)
 */
export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim() || email.split("@")[0];

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (await queryOne("SELECT id FROM users WHERE LOWER(email) = ?", [email])) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const id = crypto.randomUUID();
    await execute("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'admin')",
      [id, name.slice(0, 255), email, hashPassword(password)]);

    return NextResponse.json({ message: "User created successfully", user: { id, email, user_metadata: { name } } }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }
    console.error("Error creating user:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
