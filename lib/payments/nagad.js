import crypto from "crypto";

/**
 * Nagad Remote Payment Gateway (API v-0.2.0) — server side only.
 *
 *   1. check-out/initialize/{merchantId}/{orderId} — sensitive data encrypted with Nagad's public key
 *      and signed with our private key → paymentReferenceId + challenge (encrypted for us)
 *   2. check-out/complete/{paymentReferenceId}      — amount + challenge → callBackUrl (customer goes there)
 *   3. callback ?order_id=&payment_ref_id=&status=
 *   4. verify/payment/{paymentReferenceId}          — status = Success is the only proof of payment
 *
 * Env: NAGAD_MODE (sandbox|live), NAGAD_MERCHANT_ID, NAGAD_MERCHANT_NUMBER,
 *      NAGAD_PG_PUBLIC_KEY (Nagad's key), NAGAD_MERCHANT_PRIVATE_KEY (ours),
 *      NAGAD_BASE_URL (optional override, e.g. for a test double)
 * Keys may be full PEM or the bare base64 body; "\n" escapes in .env are accepted.
 */

const BASE = {
  sandbox: "http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs",
  live: "https://api.mynagad.com/api/dfs",
};
const TIMEOUT_MS = 30000;

function cfg() {
  return {
    mode: process.env.NAGAD_MODE === "live" ? "live" : "sandbox",
    merchantId: process.env.NAGAD_MERCHANT_ID || "",
    merchantNumber: process.env.NAGAD_MERCHANT_NUMBER || "",
    pgPublicKey: process.env.NAGAD_PG_PUBLIC_KEY || "",
    merchantPrivateKey: process.env.NAGAD_MERCHANT_PRIVATE_KEY || "",
  };
}

function base() {
  return (process.env.NAGAD_BASE_URL || BASE[cfg().mode]).replace(/\/+$/, "");
}

export function nagadConfigured() {
  const c = cfg();
  return Boolean(c.merchantId && c.merchantNumber && c.pgPublicKey && c.merchantPrivateKey);
}

function pem(key, type) {
  const k = String(key).replace(/\\n/g, "\n").trim();
  if (k.includes("-----BEGIN")) return k;
  const body = k.replace(/\s+/g, "").match(/.{1,64}/g)?.join("\n") || "";
  return `-----BEGIN ${type}-----\n${body}\n-----END ${type}-----`;
}

function publicKey() {
  return crypto.createPublicKey(pem(cfg().pgPublicKey, "PUBLIC KEY"));
}

function privateKey() {
  const raw = cfg().merchantPrivateKey;
  try {
    return crypto.createPrivateKey(pem(raw, "PRIVATE KEY"));
  } catch {
    return crypto.createPrivateKey(pem(raw, "RSA PRIVATE KEY"));
  }
}

function encrypt(text) {
  return crypto
    .publicEncrypt({ key: publicKey(), padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(text))
    .toString("base64");
}

function sign(text) {
  return crypto.sign("sha256", Buffer.from(text), privateKey()).toString("base64");
}

/**
 * Nagad encrypts its replies with RSA PKCS#1 v1.5. Recent Node versions refuse that padding for
 * private decryption, so decrypt raw and remove the padding (00 02 <non-zero bytes> 00 <message>).
 */
function decrypt(b64) {
  const key = privateKey();
  const size = key.asymmetricKeyDetails.modulusLength / 8;
  const data = Buffer.from(String(b64), "base64");
  const parts = [];
  for (let i = 0; i < data.length; i += size) {
    const block = crypto.privateDecrypt({ key, padding: crypto.constants.RSA_NO_PADDING }, data.subarray(i, i + size));
    if (block[0] !== 0x00 || block[1] !== 0x02) throw new Error("Nagad: bad padding");
    const sep = block.indexOf(0x00, 2);
    if (sep < 10) throw new Error("Nagad: bad padding");
    parts.push(block.subarray(sep + 1));
  }
  return JSON.parse(Buffer.concat(parts).toString("utf8"));
}

function dhakaStamp() {
  // YmdHis in Asia/Dhaka (UTC+6, no DST)
  const d = new Date(Date.now() + 6 * 3600 * 1000);
  return d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
}

function headers(ip) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-KM-Api-Version": "v-0.2.0",
    "X-KM-IP-V4": ip && /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) ? ip : "127.0.0.1",
    "X-KM-Client-Type": "PC_WEB",
  };
}

async function call(method, path, body, ip) {
  const res = await fetch(`${base()}${path}`, {
    method,
    headers: headers(ip),
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { status: "Error", message: "Invalid response from Nagad" };
  }
}

/** Start a payment. Returns { paymentRefId, redirectUrl, raw } or throws with Nagad's message. */
export async function nagadCreatePayment({ amount, orderId, callbackURL, ip }) {
  const c = cfg();
  const now = dhakaStamp();
  const sensitive = JSON.stringify({
    merchantId: c.merchantId,
    datetime: now,
    orderId,
    challenge: crypto.randomBytes(20).toString("hex"),
  });

  const init = await call(
    "POST",
    `/check-out/initialize/${encodeURIComponent(c.merchantId)}/${encodeURIComponent(orderId)}?locale=EN`,
    { accountNumber: c.merchantNumber, dateTime: now, sensitiveData: encrypt(sensitive), signature: sign(sensitive) },
    ip
  );
  if (!init.sensitiveData) {
    const err = new Error(`Nagad: ${init.message || "initialize failed"}`);
    err.raw = { initialize: init };
    throw err;
  }

  const plain = decrypt(init.sensitiveData);
  const refId = plain.paymentReferenceId;
  const order = JSON.stringify({
    merchantId: c.merchantId,
    orderId,
    currencyCode: "050",
    amount: Number(amount).toFixed(2),
    challenge: plain.challenge || "",
  });

  const complete = await call(
    "POST",
    `/check-out/complete/${encodeURIComponent(refId)}`,
    {
      sensitiveData: encrypt(order),
      signature: sign(order),
      merchantCallbackURL: callbackURL,
      additionalMerchantInfo: { source: "edubari-erp-subscription" },
    },
    ip
  );
  if (complete.status !== "Success" || !complete.callBackUrl) {
    const err = new Error(`Nagad: ${complete.message || "complete failed"}`);
    err.raw = { complete };
    err.paymentRefId = refId;
    throw err;
  }
  return { paymentRefId: refId, redirectUrl: complete.callBackUrl, raw: { complete } };
}

/** Confirm a payment. Returns { ok, trxId, amount, orderId, status, raw }. */
export async function nagadVerifyPayment(paymentRefId, expectedOrderId, ip) {
  const res = await call("GET", `/verify/payment/${encodeURIComponent(paymentRefId)}`, null, ip);
  const ok = res.status === "Success" && String(res.orderId || "") === String(expectedOrderId);
  return {
    ok,
    trxId: res.issuerPaymentRefNo || res.paymentRefId || null,
    amount: Number(res.amount || 0),
    orderId: res.orderId || null,
    status: res.status || "unknown",
    raw: res,
  };
}
