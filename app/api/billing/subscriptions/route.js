import { NextResponse } from "next/server";
import { query, queryOne, withTransaction, isCheckViolation, isForeignKeyViolation } from "@/lib/db";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";
import { subscriptionWithRelations } from "@/lib/subscription-billing";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const [subscriptions, clients, plans] = await Promise.all([
      query("SELECT * FROM subscriptions ORDER BY created_at DESC"),
      query("SELECT * FROM clients"),
      query("SELECT * FROM plans"),
    ]);

    const clientsMap = Object.fromEntries(clients.map((c) => [c.id, c]));
    const plansMap = Object.fromEntries(plans.map((p) => [p.id, p]));

    return NextResponse.json(
      subscriptions.map((s) => ({
        ...s,
        clients: clientsMap[s.client_id] || null,
        plans: plansMap[s.plan_id] || null,
      }))
    );
  } catch (error) {
    console.error("Error fetching subscriptions:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status } = body;

    if (!client_id || !plan_id || !payment_status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const plan = await queryOne("SELECT duration_days FROM plans WHERE id = ?", [plan_id]);
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const start = start_date ? new Date(start_date) : new Date();
    const end = end_date ? new Date(end_date) : new Date(start.getTime() + (plan.duration_days || 30) * DAY_MS);
    const grace = grace_end_date ? new Date(grace_end_date) : new Date(end.getTime() + 7 * DAY_MS);
    if ([start, end, grace].some((d) => Number.isNaN(d.getTime())) || end < start || grace < end) {
      return NextResponse.json({ error: "Dates must be valid, with start ≤ end ≤ grace end" }, { status: 400 });
    }

    const makeCurrent = is_current === undefined ? true : Boolean(is_current);

    // Switching the current subscription is atomic: the school is never left with none or two
    const created = await withTransaction(async (tx) => {
      if (makeCurrent) {
        await tx.execute("UPDATE subscriptions SET is_current = FALSE WHERE client_id = ? AND is_current", [client_id]);
      }
      const subId = crypto.randomUUID();
      await tx.execute(
        `INSERT INTO subscriptions (id, client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [subId, client_id, plan_id, start, end, grace, makeCurrent, payment_status]
      );
      return subscriptionWithRelations(tx, subId);
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (isCheckViolation(error) || isForeignKeyViolation(error)) {
      return NextResponse.json({ error: "Unknown client, plan or payment status" }, { status: 400 });
    }
    console.error("Error creating subscription:", error.message);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
