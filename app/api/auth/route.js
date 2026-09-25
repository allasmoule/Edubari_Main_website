import { NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";
import crypto from "crypto";

function hashPassword(pwd) {
  return crypto.createHash("sha256").update(pwd).digest("hex");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, password } = body;

    if (action === "login") {
      const hashed = hashPassword(password);
      const user = await queryOne(
        "SELECT * FROM users WHERE email = ? AND (password = ? OR password = ?)",
        [email, hashed, password]
      );

      if (!user) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const session = {
        access_token: `token_${user.id}_${Date.now()}`,
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { name: user.name, role: user.role },
        },
      };

      return NextResponse.json({ data: { user: session.user, session }, error: null });
    }

    if (action === "create_user") {
      const { email, password, name = "Admin User" } = body;
      const userId = crypto.randomUUID();
      const hashed = hashPassword(password);

      await execute(
        "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [userId, name, email, hashed, "admin"]
      );

      return NextResponse.json({ data: { user: { id: userId, email, user_metadata: { name } } }, error: null });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
