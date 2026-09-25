import { NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  try {
    const subscriptions = await query("SELECT * FROM subscriptions ORDER BY created_at DESC");
    const clients = await query("SELECT * FROM clients");
    const plans = await query("SELECT * FROM plans");

    const clientsMap = {};
    (clients || []).forEach((c) => {
      clientsMap[c.id] = c;
    });

    const plansMap = {};
    (plans || []).forEach((p) => {
      plansMap[p.id] = p;
    });

    const result = (subscriptions || []).map((s) => ({
      ...s,
      clients: clientsMap[s.client_id] || null,
      plans: plansMap[s.plan_id] || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching subscriptions:", error.message);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status } = body;

    if (!client_id || !plan_id || !payment_status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const plan = await queryOne("SELECT duration_days FROM plans WHERE id = ?", [plan_id]);
    const durationDays = plan ? plan.duration_days : 30;

    const start = start_date ? new Date(start_date) : new Date();
    const end = end_date ? new Date(end_date) : new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const grace = grace_end_date ? new Date(grace_end_date) : new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000);

    const currentActive = is_current !== undefined ? (is_current ? 1 : 0) : 1;

    if (currentActive === 1) {
      await execute("UPDATE subscriptions SET is_current = 0 WHERE client_id = ?", [client_id]);
    }

    const subId = crypto.randomUUID();
    await execute(
      `INSERT INTO subscriptions (id, client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [subId, client_id, plan_id, start, end, grace, currentActive, payment_status]
    );

    const createdSub = await queryOne("SELECT * FROM subscriptions WHERE id = ?", [subId]);
    const client = await queryOne("SELECT * FROM clients WHERE id = ?", [client_id]);
    const planObj = await queryOne("SELECT * FROM plans WHERE id = ?", [plan_id]);

    return NextResponse.json(
      {
        ...createdSub,
        clients: client || null,
        plans: planObj || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subscription:", error.message);
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 });
  }
}
