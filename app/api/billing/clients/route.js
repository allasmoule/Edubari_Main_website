import { NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  try {
    const clients = await query("SELECT * FROM clients ORDER BY created_at DESC");
    const subscriptions = await query("SELECT * FROM subscriptions WHERE is_current = 1");
    const plans = await query("SELECT * FROM plans");

    const plansMap = {};
    (plans || []).forEach((p) => {
      plansMap[p.id] = p;
    });

    const subsMap = {};
    (subscriptions || []).forEach((s) => {
      subsMap[s.client_id] = {
        ...s,
        plans: plansMap[s.plan_id] || null,
      };
    });

    const result = (clients || []).map((c) => ({
      ...c,
      subscriptions: subsMap[c.id] ? [subsMap[c.id]] : [],
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching clients:", error.message);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { client_name, domain, status, phone, plan_id, logo_url, client_type } = body;

    if (!client_name || !domain || !status || !plan_id) {
      return NextResponse.json({ error: "Client name, domain, status, and plan are required" }, { status: 400 });
    }

    const plan = await queryOne("SELECT * FROM plans WHERE id = ?", [plan_id]);
    if (!plan) {
      return NextResponse.json({ error: "Selected pricing plan not found" }, { status: 404 });
    }

    const resolvedType = client_type || "school_erp";

    // Auto-generate 64-character hex ERP credentials for all clients
    const erpToken = crypto.randomBytes(32).toString("hex");
    const erpSecret = crypto.randomBytes(32).toString("hex");

    const clientId = crypto.randomUUID();
    await execute(
      "INSERT INTO clients (id, client_name, domain, phone, logo_url, status, client_type, erp_api_token, erp_secret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [clientId, client_name, domain, phone || null, logo_url || null, status || "active", resolvedType, erpToken, erpSecret]
    );

    const start = new Date();
    const end = new Date(start.getTime() + (plan.duration_days || 30) * 24 * 60 * 60 * 1000);
    const grace = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000);

    const subId = crypto.randomUUID();
    await execute(
      `INSERT INTO subscriptions (id, client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, 1, 'paid')`,
      [subId, clientId, plan.id, start, end, grace]
    );

    // Create tracking row in erp_connections table
    const erpConnId = crypto.randomUUID();
    await execute(
      `INSERT INTO erp_connections (id, client_id, domain, erp_api_token, connection_status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [erpConnId, clientId, domain, erpToken]
    ).catch(() => {}); // non-blocking if duplicate key

    const createdClient = await queryOne("SELECT * FROM clients WHERE id = ?", [clientId]);
    return NextResponse.json({
      ...createdClient,
      erp_api_token: createdClient?.erp_api_token || erpToken,
      erp_secret: createdClient?.erp_secret || erpSecret,
      erpToken: createdClient?.erp_api_token || erpToken,
      erpSecret: createdClient?.erp_secret || erpSecret,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error.message);
    return NextResponse.json({ error: error.message || "Failed to create client" }, { status: 500 });
  }
}
