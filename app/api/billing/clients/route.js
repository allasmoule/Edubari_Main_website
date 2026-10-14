import { NextResponse } from "next/server";
import { query, queryOne, withTransaction, isUniqueViolation } from "@/lib/db";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";
import { cleanDomain } from "@/lib/safe-redirect";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const clients = await query("SELECT * FROM clients ORDER BY created_at DESC");
    const subscriptions = await query("SELECT * FROM subscriptions WHERE is_current");
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

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

    const cleanedDomain = cleanDomain(domain);
    if (!cleanedDomain) {
      return NextResponse.json({ error: "Enter a valid domain" }, { status: 400 });
    }

    // Client, first subscription and ERP connection are created together or not at all
    const createdClient = await withTransaction(async (tx) => {
      const clientId = crypto.randomUUID();
      const client = await tx.queryOne(
        `INSERT INTO clients (id, client_name, domain, phone, logo_url, status, client_type, erp_api_token, erp_secret)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        [clientId, client_name, cleanedDomain, phone || null, logo_url || null, status || "active", resolvedType, erpToken, erpSecret]
      );

      const start = new Date();
      const end = new Date(start.getTime() + (plan.duration_days || 30) * 24 * 60 * 60 * 1000);
      const grace = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000);
      await tx.execute(
        `INSERT INTO subscriptions (id, client_id, plan_id, start_date, end_date, grace_end_date, is_current, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, TRUE, 'paid')`,
        [crypto.randomUUID(), clientId, plan.id, start, end, grace]
      );

      await tx.execute(
        `INSERT INTO erp_connections (id, client_id, domain, erp_api_token, connection_status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [crypto.randomUUID(), clientId, cleanedDomain, erpToken]
      );
      return client;
    });
    return NextResponse.json({
      ...createdClient,
      erp_api_token: createdClient?.erp_api_token || erpToken,
      erp_secret: createdClient?.erp_secret || erpSecret,
      erpToken: createdClient?.erp_api_token || erpToken,
      erpSecret: createdClient?.erp_secret || erpSecret,
    }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "This domain is already registered" }, { status: 409 });
    }
    console.error("Error creating client:", error.message);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
