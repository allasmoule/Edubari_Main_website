import crypto from "crypto";
import pool, { query, queryOne, execute } from "./db";

/**
 * School ERP subscription billing.
 *
 * Every payment (bKash, Nagad or entered by an admin) is one row in subscription_payments.
 * Completing a row extends the school's current subscription exactly once:
 *   new end = max(now, current end) + plan.duration_days × periods, grace = end + 7 days.
 * A school that is still paid up keeps its remaining days; an expired one starts again from today.
 * A suspended school stays suspended — suspension is an admin decision, not a billing one.
 */

export const GRACE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export function newInvoice() {
  // Short and alphanumeric: Nagad order IDs must be at most 20 characters
  return `EB${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

/** Public base URL the gateways send the customer back to (this website). */
export function callbackBase() {
  return (process.env.PAYMENT_CALLBACK_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
}

/** Where to send the customer after a gateway callback: the ERP page it came from, or our status page. */
export function returnTarget(payment, domain) {
  if (payment?.return_url) return payment.return_url;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${site}/check-subscription${domain ? `?domain=${encodeURIComponent(domain)}` : ""}`;
}

/** The school's client row plus its current subscription joined with the plan (or null). */
export async function getSchoolBilling(clientId) {
  const client = await queryOne("SELECT * FROM clients WHERE id = ?", [clientId]);
  if (!client) return { client: null, sub: null };
  const sub = await queryOne(
    `SELECT s.*, p.plan_name, p.plan_type, p.price, p.duration_days
       FROM subscriptions s JOIN plans p ON p.id = s.plan_id
      WHERE s.client_id = ? AND s.is_current = 1
      ORDER BY s.created_at DESC LIMIT 1`,
    [clientId]
  );
  return { client, sub };
}

export function subscriptionState(sub, now = new Date()) {
  if (!sub) return "no_subscription";
  if (now < new Date(sub.end_date)) return "active";
  if (now < new Date(sub.grace_end_date)) return "grace_period";
  return "expired";
}

export async function createPaymentRow(fields) {
  const id = crypto.randomUUID();
  const row = {
    id,
    client_id: fields.client_id,
    plan_id: fields.plan_id || null,
    subscription_id: fields.subscription_id || null,
    method: fields.method,
    source: fields.source || "gateway",
    channel: fields.channel || null,
    periods: fields.periods || 1,
    amount: Number(fields.amount).toFixed(2),
    currency: "BDT",
    status: "initiated",
    merchant_invoice: fields.merchant_invoice || newInvoice(),
    trx_id: fields.trx_id || null,
    payer_reference: fields.payer_reference || null,
    return_url: fields.return_url || null,
    recorded_by: fields.recorded_by || null,
    note: fields.note || null,
  };
  const cols = Object.keys(row);
  await execute(
    `INSERT INTO subscription_payments (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
    cols.map((c) => row[c])
  );
  return row;
}

export async function getPayment(where, value) {
  const column = { id: "id", invoice: "merchant_invoice", gateway: "gateway_payment_id" }[where];
  return queryOne(`SELECT * FROM subscription_payments WHERE ${column} = ?`, [value]);
}

export async function setGatewayPaymentId(paymentId, gatewayPaymentId, raw) {
  await execute(
    "UPDATE subscription_payments SET gateway_payment_id = ?, gateway_response = ? WHERE id = ? AND status = 'initiated'",
    [gatewayPaymentId, JSON.stringify(raw || {}), paymentId]
  );
}

/** Record a failed / cancelled attempt (never touches a completed payment). */
export async function markPaymentFailed(paymentId, status, reason, raw) {
  await execute(
    `UPDATE subscription_payments SET status = ?, failure_reason = ?, gateway_response = COALESCE(?, gateway_response)
      WHERE id = ? AND status <> 'completed'`,
    [status === "cancelled" ? "cancelled" : "failed", String(reason || "").slice(0, 255), raw ? JSON.stringify(raw) : null, paymentId]
  );
}

/**
 * Complete a payment and extend the subscription, inside one transaction.
 * Safe to call twice (a second callback, a page refresh): only the first call extends.
 * `paidAmount` (from the gateway) must match the amount we asked for, unless `trusted` (admin entry).
 * Returns { ok, already, payment, period_end } or { ok: false, reason }.
 */
export async function completePayment(paymentId, { trxId, paidAmount, raw, trusted = false } = {}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[payment]] = await conn.query("SELECT * FROM subscription_payments WHERE id = ? FOR UPDATE", [paymentId]);
    if (!payment) {
      await conn.rollback();
      return { ok: false, reason: "payment_not_found" };
    }
    if (payment.status === "completed") {
      await conn.rollback();
      return { ok: true, already: true, payment, period_end: payment.period_end };
    }
    if (!trusted && Math.abs(Number(paidAmount) - Number(payment.amount)) > 0.009) {
      await conn.query(
        "UPDATE subscription_payments SET status = 'failed', failure_reason = ?, gateway_response = ? WHERE id = ?",
        [`amount_mismatch: paid ${paidAmount}, expected ${payment.amount}`, JSON.stringify(raw || {}), paymentId]
      );
      await conn.commit();
      return { ok: false, reason: "amount_mismatch" };
    }

    // Lock the school's current subscription so two payments cannot extend from the same end date
    const [[sub]] = await conn.query(
      "SELECT * FROM subscriptions WHERE client_id = ? AND is_current = 1 ORDER BY created_at DESC LIMIT 1 FOR UPDATE",
      [payment.client_id]
    );
    const planId = payment.plan_id || sub?.plan_id;
    const [[plan]] = await conn.query("SELECT * FROM plans WHERE id = ?", [planId]);
    if (!plan) {
      await conn.rollback();
      return { ok: false, reason: "plan_not_found" };
    }

    const now = new Date();
    const currentEnd = sub ? new Date(sub.end_date) : null;
    const periodStart = currentEnd && currentEnd > now ? currentEnd : now;
    const periodEnd = new Date(periodStart.getTime() + (Number(plan.duration_days) || 30) * Number(payment.periods || 1) * DAY_MS);
    const graceEnd = new Date(periodEnd.getTime() + GRACE_DAYS * DAY_MS);

    let subscriptionId = sub?.id;
    if (sub) {
      // A school that had fully lapsed starts a fresh term today; a paid-up one keeps its start date
      const startDate = currentEnd > now ? sub.start_date : now;
      await conn.query(
        `UPDATE subscriptions SET plan_id = ?, start_date = ?, end_date = ?, grace_end_date = ?, payment_status = 'paid'
          WHERE id = ?`,
        [plan.id, startDate, periodEnd, graceEnd, sub.id]
      );
    } else {
      subscriptionId = crypto.randomUUID();
      await conn.query(
        `INSERT INTO subscriptions (id, client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, 1, 'paid')`,
        [subscriptionId, payment.client_id, plan.id, now, periodEnd, graceEnd]
      );
    }

    await conn.query(
      `UPDATE subscription_payments
          SET status = 'completed', trx_id = COALESCE(?, trx_id), plan_id = ?, subscription_id = ?,
              period_start = ?, period_end = ?, completed_at = ?, failure_reason = NULL,
              gateway_response = COALESCE(?, gateway_response)
        WHERE id = ?`,
      [trxId || null, plan.id, subscriptionId, periodStart, periodEnd, now, raw ? JSON.stringify(raw) : null, paymentId]
    );
    await conn.commit();
    return { ok: true, already: false, payment: { ...payment, status: "completed" }, period_end: periodEnd };
  } catch (error) {
    await conn.rollback().catch(() => {});
    throw error;
  } finally {
    conn.release();
  }
}

/** Completed payments of one school, newest first (for the ERP and the admin panel). */
export async function listPayments({ clientId, limit = 200 } = {}) {
  const params = [];
  let where = "";
  if (clientId) {
    where = "WHERE sp.client_id = ?";
    params.push(clientId);
  }
  params.push(Math.min(Number(limit) || 200, 500));
  return query(
    `SELECT sp.id, sp.client_id, c.client_name, c.domain, sp.plan_id, p.plan_name, sp.method, sp.source,
            sp.channel, sp.periods, sp.amount, sp.currency, sp.status, sp.merchant_invoice, sp.trx_id,
            sp.period_start, sp.period_end, sp.note, sp.failure_reason, sp.created_at, sp.completed_at
       FROM subscription_payments sp
       JOIN clients c ON c.id = sp.client_id
       LEFT JOIN plans p ON p.id = sp.plan_id
       ${where}
      ORDER BY sp.created_at DESC
      LIMIT ?`,
    params
  );
}
