/**
 * bKash Tokenized Checkout (v1.2.0-beta) — server side only.
 *
 *   1. token/grant   — username/password + app key/secret → id_token (cached until shortly before expiry)
 *   2. create        — amount + our invoice + callbackURL → paymentID + bkashURL (customer goes there)
 *   3. callback      — bKash sends the customer back with ?paymentID=&status=success|failure|cancel
 *   4. execute       — only this (or payment/status) proves the money arrived: transactionStatus = Completed
 *
 * Env: BKASH_MODE (sandbox|live), BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD,
 *      BKASH_BASE_URL (optional override, e.g. for a test double)
 */

const BASE = {
  sandbox: "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout",
  live: "https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout",
};
const TIMEOUT_MS = 30000;

let cachedToken = null; // { value, expiresAt }

function cfg() {
  return {
    mode: process.env.BKASH_MODE === "live" ? "live" : "sandbox",
    appKey: process.env.BKASH_APP_KEY || "",
    appSecret: process.env.BKASH_APP_SECRET || "",
    username: process.env.BKASH_USERNAME || "",
    password: process.env.BKASH_PASSWORD || "",
  };
}

function base() {
  return (process.env.BKASH_BASE_URL || BASE[cfg().mode]).replace(/\/+$/, "");
}

export function bkashConfigured() {
  const c = cfg();
  return Boolean(c.appKey && c.appSecret && c.username && c.password);
}

async function post(path, body, headers) {
  const res = await fetch(`${base()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { statusCode: String(res.status), statusMessage: "Invalid response from bKash" };
  }
}

async function token() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  const c = cfg();
  const res = await post(
    "/token/grant",
    { app_key: c.appKey, app_secret: c.appSecret },
    { username: c.username, password: c.password }
  );
  if (!res.id_token) {
    throw new Error(`bKash: token grant failed (${res.statusMessage || res.msg || "unknown"})`);
  }
  // Refresh a minute early; bKash tokens normally live 3600 s
  const ttl = Math.max(60, Number(res.expires_in) || 3600) - 60;
  cachedToken = { value: res.id_token, expiresAt: Date.now() + ttl * 1000 };
  return res.id_token;
}

async function authed(path, body) {
  const headers = { Authorization: await token(), "X-APP-Key": cfg().appKey };
  return post(path, body, headers);
}

/** Start a payment. Returns { paymentID, bkashURL, raw } or throws with bKash's message. */
export async function bkashCreatePayment({ amount, invoice, payerReference, callbackURL }) {
  const res = await authed("/create", {
    mode: "0011",
    payerReference: String(payerReference || invoice).slice(0, 255),
    callbackURL,
    amount: Number(amount).toFixed(2),
    currency: "BDT",
    intent: "sale",
    merchantInvoiceNumber: invoice,
  });
  if (res.statusCode !== "0000" || !res.paymentID || !res.bkashURL) {
    const err = new Error(`bKash: ${res.statusMessage || "create payment failed"}`);
    err.raw = res;
    throw err;
  }
  return { paymentID: res.paymentID, bkashURL: res.bkashURL, raw: res };
}

/**
 * Confirm a payment after the customer returns. Execute first; if that does not say Completed
 * (e.g. it was already executed on an earlier callback), ask payment/status.
 * Returns { ok, trxId, amount, invoice, status, raw }.
 */
export async function bkashVerifyPayment(paymentID) {
  const executed = await authed("/execute", { paymentID });
  let res = executed;
  if (executed.transactionStatus !== "Completed") {
    res = await authed("/payment/status", { paymentID });
  }
  const ok = res.transactionStatus === "Completed" && res.paymentID === paymentID;
  return {
    ok,
    trxId: res.trxID || null,
    amount: Number(res.amount || 0),
    invoice: res.merchantInvoiceNumber || null,
    status: res.transactionStatus || res.statusMessage || "unknown",
    raw: { execute: executed, ...(res === executed ? {} : { status: res }) },
  };
}

/** Test helper: forget the cached token (used when credentials change) */
export function resetBkashToken() {
  cachedToken = null;
}
