import crypto from "crypto";
import { execute, queryOne } from "./db";

/**
 * Authenticate a request from a School ERP server.
 *
 * The ERP sends:
 *   X-Edubari-Token:     its erp_api_token
 *   X-Edubari-Timestamp: unix seconds
 *   X-Edubari-Nonce:     random 16-64 characters, new for every request
 *   X-Edubari-Signature: hex HMAC-SHA256(erp_secret, `${timestamp}.${nonce}.${METHOD}.${pathname}.${rawBody}`)
 *
 * The secret itself never travels. Requests older than 5 minutes, or a nonce already used by
 * the same school, are rejected so a captured request cannot be replayed.
 */

const WINDOW_SECONDS = 300;

/**
 * Record a nonce as used. Stored in PostgreSQL (erp_request_nonces) so a replay is caught by every
 * server instance. Returns false when the same school already used this nonce.
 */
async function spendNonce(key) {
  const { rowCount } = await execute(
    `INSERT INTO erp_request_nonces (nonce_key, expires_at) VALUES (?, NOW() + make_interval(secs => ?::int))
     ON CONFLICT (nonce_key) DO NOTHING`,
    [key, WINDOW_SECONDS * 2]
  );
  if (rowCount === 0) return false;
  if (Math.random() < 0.02) {
    await execute("DELETE FROM erp_request_nonces WHERE expires_at < NOW()").catch(() => {});
  }
  return true;
}

export function signErpRequest(secret, { timestamp, nonce, method, pathname, body = "" }) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${nonce}.${method.toUpperCase()}.${pathname}.${body}`)
    .digest("hex");
}

/**
 * Returns { client, rawBody } for a valid School ERP request, otherwise { response } (401/403).
 * Reads the body itself, so callers must use the returned rawBody instead of request.json().
 */
export async function authenticateErp(request) {
  const deny = (status, error) => ({ response: Response.json({ error }, { status }) });
  const token = request.headers.get("x-edubari-token") || "";
  const ts = request.headers.get("x-edubari-timestamp") || "";
  const nonce = request.headers.get("x-edubari-nonce") || "";
  const signature = (request.headers.get("x-edubari-signature") || "").toLowerCase();
  const rawBody = request.method === "GET" || request.method === "HEAD" ? "" : await request.text();

  if (!token || !ts || !/^[0-9a-f]{64}$/.test(signature) || !/^[A-Za-z0-9_-]{16,64}$/.test(nonce)) {
    return deny(401, "Missing ERP signature headers");
  }
  if (!/^\d{9,11}$/.test(ts) || Math.abs(Date.now() / 1000 - Number(ts)) > WINDOW_SECONDS) {
    return deny(401, "Request timestamp is too old or invalid");
  }
  const client = await queryOne("SELECT * FROM clients WHERE erp_api_token = ?", [token]);
  if (!client || !client.erp_secret) return deny(401, "Invalid ERP credentials");

  const expected = signErpRequest(client.erp_secret, {
    timestamp: ts,
    nonce,
    method: request.method,
    pathname: new URL(request.url).pathname,
    body: rawBody,
  });
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return deny(401, "Invalid ERP credentials");

  // Only a correctly signed request can spend a nonce (so strangers cannot fill the table)
  if (!(await spendNonce(`${token.slice(0, 64)}:${nonce}`))) return deny(401, "Request already used");
  if (client.client_type !== "school_erp") return deny(403, "This endpoint is only for School ERP clients");
  return { client, rawBody };
}
