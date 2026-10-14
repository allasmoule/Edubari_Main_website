import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * GET /api/public/clients — the public institution directory.
 *
 * Used by the home page (trusted clients, pricing) and /check-subscription. It returns only
 * what may be shown to anyone: name, domain, logo, type, and the current subscription's
 * dates. Never ERP tokens/secrets, phone numbers, prices or payment details.
 */
export async function GET() {
  try {
    const rows = await query(
      `SELECT c.id, c.client_name, c.domain, c.logo_url, c.client_type, c.status,
              s.start_date, s.end_date, s.grace_end_date, p.plan_name
       FROM clients c
       LEFT JOIN subscriptions s ON s.client_id = c.id AND s.is_current
       LEFT JOIN plans p ON p.id = s.plan_id
       ORDER BY c.client_name`
    );

    const byClient = new Map();
    for (const r of rows || []) {
      if (!byClient.has(r.id)) {
        byClient.set(r.id, {
          id: r.id,
          client_name: r.client_name,
          domain: r.domain,
          logo_url: r.logo_url,
          client_type: r.client_type,
          status: r.status === "suspended" ? "suspended" : "active",
          subscriptions: [],
        });
      }
      if (r.end_date) {
        byClient.get(r.id).subscriptions.push({
          is_current: true,
          start_date: r.start_date,
          end_date: r.end_date,
          grace_end_date: r.grace_end_date,
          plans: r.plan_name ? { plan_name: r.plan_name } : null,
        });
      }
    }
    return NextResponse.json([...byClient.values()]);
  } catch (error) {
    console.error("Error fetching public clients:", error.message);
    return NextResponse.json([]);
  }
}
