import { NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/**
 * POST /api/erp/ping
 *
 * Laravel ERP sends a heartbeat every hour.
 * Updates last_ping_at and connection_status in erp_connections.
 *
 * Body: { token, laravel_version?, erp_version? }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { token, laravel_version, erp_version } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing API token" }, { status: 401 });
    }

    const client = await queryOne(
      "SELECT id, status FROM clients WHERE erp_api_token = ?",
      [token]
    );

    if (!client) {
      return NextResponse.json({ error: "Invalid API token" }, { status: 403 });
    }

    await execute(
      `UPDATE erp_connections 
       SET last_ping_at = NOW(), 
           connection_status = 'connected',
           laravel_version = COALESCE(?, laravel_version),
           erp_version = COALESCE(?, erp_version)
       WHERE erp_api_token = ?`,
      [laravel_version || null, erp_version || null, token]
    );

    return NextResponse.json({
      ok: true,
      status: client.status,
      pinged_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ERP Ping] Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * GET /api/erp/ping — Admin: list all ERP connections
 */
export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const rows = await query(
      `SELECT ec.*, c.client_name, c.domain, c.status AS client_status,
              s.end_date AS subscription_end_date, s.grace_end_date AS subscription_grace_end_date,
              p.plan_name, p.price AS plan_price
       FROM erp_connections ec
       LEFT JOIN clients c ON ec.client_id = c.id
       LEFT JOIN subscriptions s ON s.client_id = ec.client_id AND s.is_current
       LEFT JOIN plans p ON p.id = s.plan_id
       ORDER BY ec.last_ping_at DESC NULLS LAST`
    );
    return NextResponse.json(rows || []);
  } catch (error) {
    console.error("[ERP Ping GET] Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
