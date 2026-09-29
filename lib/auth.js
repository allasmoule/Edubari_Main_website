import crypto from "crypto";
import { NextResponse } from "next/server";
import { execute, queryOne } from "@/lib/db";

/**
 * Admin-only authentication for the central website.
 *
 * - Passwords: scrypt with a random salt ("scrypt$<salt>$<hash>"). Old SHA-256 hashes still
 *   verify once and are upgraded on the next successful login. Plain-text passwords are
 *   never accepted.
 * - Session: an HMAC-signed token in an httpOnly cookie. Every admin API checks it on the
 *   server (the browser's localStorage copy is only used to draw the UI).
 * - Only users with role "admin" can sign in; there is no other kind of login.
 */

export const SESSION_COOKIE = "edubari_admin";
const SESSION_TTL_SECONDS = 12 * 60 * 60;
const KNOWN_WEAK_SECRETS = new Set(["edubari_secret_jwt_key_2026", "secret", "changeme"]);

let ephemeralSecret = null;

function sessionSecret() {
  const candidates = [process.env.ADMIN_SESSION_SECRET, process.env.JWT_SECRET];
  for (const value of candidates) {
    if (value && value.length >= 32 && !KNOWN_WEAK_SECRETS.has(value)) return value;
  }
  // No strong secret configured: sessions still work, but only until the server restarts
  if (!ephemeralSecret) {
    ephemeralSecret = crypto.randomBytes(48).toString("base64url");
    console.warn("[Auth] ADMIN_SESSION_SECRET is missing or weak — using a temporary secret. Set a random 48+ character ADMIN_SESSION_SECRET in .env.");
  }
  return ephemeralSecret;
}

/* ---------------- passwords ---------------- */

const SCRYPT_KEYLEN = 64;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

/** Returns { ok, needsUpgrade } */
export function verifyPassword(password, stored) {
  const value = String(stored || "");
  if (value.startsWith("scrypt$")) {
    const [, saltB64, hashB64] = value.split("$");
    if (!saltB64 || !hashB64) return { ok: false, needsUpgrade: false };
    const expected = Buffer.from(hashB64, "base64");
    const actual = crypto.scryptSync(String(password), Buffer.from(saltB64, "base64"), expected.length);
    return { ok: crypto.timingSafeEqual(expected, actual), needsUpgrade: false };
  }
  // Legacy unsalted SHA-256 (64 hex chars) — accepted once, then upgraded to scrypt
  if (/^[0-9a-f]{64}$/i.test(value)) {
    const actual = crypto.createHash("sha256").update(String(password)).digest("hex");
    const ok = crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(value.toLowerCase(), "hex"));
    return { ok, needsUpgrade: ok };
  }
  return { ok: false, needsUpgrade: false };
}

/* ---------------- session token ---------------- */

function sign(data) {
  return crypto.createHmac("sha256", sessionSecret()).update(data).digest("base64url");
}

export function createSessionToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ sub: user.id, role: "admin", iat: now, exp: now + SESSION_TTL_SECONDS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readSessionToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = sign(payload);
  const a = Buffer.from(signature || "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data?.sub || data.role !== "admin" || !(data.exp > Math.floor(Date.now() / 1000))) return null;
    return data;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/** The signed-in admin for this request, or null. The user must still exist as an admin. */
export async function getAdmin(request) {
  const data = readSessionToken(request.cookies?.get(SESSION_COOKIE)?.value);
  if (!data) return null;
  const user = await queryOne("SELECT id, name, email, role FROM users WHERE id = ?", [data.sub]).catch(() => null);
  if (!user || user.role !== "admin") return null;
  return user;
}

/**
 * Use at the top of every admin route handler:
 *   const auth = await requireAdmin(request); if (auth.response) return auth.response;
 */
export async function requireAdmin(request) {
  const user = await getAdmin(request);
  if (!user) {
    return { response: NextResponse.json({ error: "অ্যাডমিন লগইন প্রয়োজন" }, { status: 401 }) };
  }
  return { user };
}

/* ---------------- login rate limit ---------------- */

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 10;

export function clientIp(request) {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
}

// Failed attempts are kept in MySQL (admin_login_attempts) so every server instance sees them.

/** true when this IP has used up its login attempts */
export async function loginLimited(ip) {
  const row = await queryOne("SELECT attempts FROM admin_login_attempts WHERE ip = ? AND reset_at > NOW()", [ip]);
  return Boolean(row) && Number(row.attempts) >= MAX_ATTEMPTS;
}

export async function recordLoginFailure(ip) {
  await execute(
    `INSERT INTO admin_login_attempts (ip, attempts, reset_at) VALUES (?, 1, NOW() + INTERVAL ${WINDOW_MINUTES} MINUTE)
     ON DUPLICATE KEY UPDATE
       attempts = IF(reset_at > NOW(), attempts + 1, 1),
       reset_at = IF(reset_at > NOW(), reset_at, NOW() + INTERVAL ${WINDOW_MINUTES} MINUTE)`,
    [ip]
  );
}

export async function clearLoginFailures(ip) {
  await execute("DELETE FROM admin_login_attempts WHERE ip = ?", [ip]);
}
