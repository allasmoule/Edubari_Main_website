import { NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";
import {
  SESSION_COOKIE,
  clearLoginFailures,
  clientIp,
  createSessionToken,
  getAdmin,
  hashPassword,
  loginLimited,
  recordLoginFailure,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

// Constant work for unknown emails so the response time doesn't reveal which emails exist
const DUMMY_HASH = hashPassword("dummy-password-for-timing");

function publicUser(user) {
  return { id: user.id, email: user.email, user_metadata: { name: user.name, role: "admin" } };
}

/**
 * POST /api/auth  { action: "login", email, password }  → sets the admin session cookie
 * POST /api/auth  { action: "logout" }                   → clears it
 * Only admin users can sign in. Creating users is done by a signed-in admin via /api/users.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === "logout") {
      const res = NextResponse.json({ data: null, error: null });
      res.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
      return res;
    }

    if (action === "login") {
      const ip = clientIp(request);
      if (await loginLimited(ip)) {
        return NextResponse.json({ error: "অনেকবার ভুল চেষ্টা — ১৫ মিনিট পরে আবার চেষ্টা করুন" }, { status: 429 });
      }

      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = email ? await queryOne("SELECT * FROM users WHERE LOWER(email) = ?", [email]) : null;
      const { ok, needsUpgrade } = verifyPassword(password, user?.password || DUMMY_HASH);

      if (!user || !ok || user.role !== "admin") {
        await recordLoginFailure(ip);
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      await clearLoginFailures(ip);

      if (needsUpgrade) {
        await execute("UPDATE users SET password = ? WHERE id = ?", [hashPassword(password), user.id]).catch(() => {});
      }

      const token = createSessionToken(user);
      // The browser keeps only a display copy; the real session is the httpOnly cookie
      const session = { user: publicUser(user), expires_in: 12 * 60 * 60 };
      const res = NextResponse.json({ data: { user: session.user, session }, error: null });
      res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
      return res;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const errorMsg = error?.message || error?.sqlMessage || error?.code || "Internal Server Error";
    console.error("Auth API Error:", errorMsg, error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

/** GET /api/auth — the signed-in admin (used by the admin layout), or 401 */
export async function GET(request) {
  const user = await getAdmin(request);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json({ data: { user: publicUser(user) }, error: null });
}
