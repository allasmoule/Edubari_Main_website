import { NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import crypto from "crypto";

function parseRowJsonFields(row) {
  if (!row) return row;
  const newRow = { ...row };
  for (const key of Object.keys(newRow)) {
    const val = newRow[key];
    if (typeof val === "string") {
      const trimmed = val.trim();
      if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
          newRow[key] = JSON.parse(val);
        } catch (_) {}
      }
    }
  }
  return newRow;
}

export async function GET() {
  try {
    const rows = await query("SELECT * FROM plans ORDER BY sort_order ASC, price ASC");
    const parsed = (rows || []).map((r) => parseRowJsonFields(r));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error fetching billing plans:", error.message);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      plan_name,
      duration_days,
      max_students,
      max_instructors,
      price,
      features,
      plan_tier = "free",
      max_batches = 1,
      monthly_ai_credits = 0,
      show_branding = true,
      is_active = true,
      sort_order = 0,
      feature_gates = {},
      old_price = null,
      price_label = null,
      duration = null,
      description = null,
      popular = false,
      badge = null,
    } = body;

    if (!plan_name || duration_days === undefined || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const planId = crypto.randomUUID();
    const featuresJson = JSON.stringify(Array.isArray(features) ? features : []);
    const featureGatesJson = JSON.stringify(feature_gates || {});

    await execute(
      `INSERT INTO plans 
       (id, plan_name, duration_days, max_students, max_instructors, price, features, plan_tier, max_batches, monthly_ai_credits, show_branding, is_active, sort_order, feature_gates, old_price, price_label, duration, description, popular, badge) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        planId,
        plan_name,
        Number(duration_days),
        Number(max_students || 100),
        Number(max_instructors || 10),
        Number(price),
        featuresJson,
        plan_tier,
        Number(max_batches),
        Number(monthly_ai_credits),
        Boolean(show_branding),
        Boolean(is_active),
        Number(sort_order),
        featureGatesJson,
        old_price ? Number(old_price) : null,
        price_label,
        duration,
        description,
        Boolean(popular),
        badge,
      ]
    );

    const created = await queryOne("SELECT * FROM plans WHERE id = ?", [planId]);
    return NextResponse.json(parseRowJsonFields(created), { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error.message);
    return NextResponse.json({ error: error.message || "Failed to create plan" }, { status: 500 });
  }
}
