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

function mapPlanFromDb(row) {
  if (!row) return null;
  const parsedRow = parseRowJsonFields(row);
  return {
    ...parsedRow,
    id: parsedRow.id,
    _id: parsedRow.id,
    name: parsedRow.plan_name || "Default Plan",
    plan_name: parsedRow.plan_name,
    durationDays: parsedRow.duration_days || 30,
    duration_days: parsedRow.duration_days || 30,
    maxStudents: parsedRow.max_students || 200,
    max_students: parsedRow.max_students || 200,
    maxInstructors: parsedRow.max_instructors || 10,
    max_instructors: parsedRow.max_instructors || 10,
    maxBatches: parsedRow.max_batches || 1,
    max_batches: parsedRow.max_batches || 1,
    monthlyAiCredits: parsedRow.monthly_ai_credits || 0,
    monthly_ai_credits: parsedRow.monthly_ai_credits || 0,
    showBranding: Boolean(parsedRow.show_branding ?? true),
    show_branding: Boolean(parsedRow.show_branding ?? true),
    active: Boolean(parsedRow.is_active ?? true),
    is_active: Boolean(parsedRow.is_active ?? true),
    sortOrder: parsedRow.sort_order || 0,
    sort_order: parsedRow.sort_order || 0,
    featureGates: parsedRow.feature_gates || {},
    feature_gates: parsedRow.feature_gates || {},
    price: Number(parsedRow.price || 0),
    oldPrice: parsedRow.old_price ? Number(parsedRow.old_price) : null,
    priceLabel: parsedRow.price_label || `৳${Number(parsedRow.price || 0).toLocaleString()}/${parsedRow.duration_days === 365 ? 'year' : 'month'}`,
    duration: parsedRow.duration || (parsedRow.duration_days === 365 ? 'Yearly' : parsedRow.duration_days === 30 ? 'Monthly' : `${parsedRow.duration_days} Days`),
    features: Array.isArray(parsedRow.features) ? parsedRow.features : [],
    popular: Boolean(parsedRow.popular ?? false),
    badge: parsedRow.badge || null,
    planTier: parsedRow.plan_tier || 'free',
    plan_tier: parsedRow.plan_tier || 'free',
    planType: parsedRow.plan_type || 'single_teacher',
    plan_type: parsedRow.plan_type || 'single_teacher',
  };
}

export async function GET() {
  try {
    const rows = await query("SELECT * FROM plans ORDER BY sort_order ASC, price ASC");
    const mappedPlans = (rows || []).map(mapPlanFromDb);
    return NextResponse.json(mappedPlans);
  } catch (error) {
    console.error("Error fetching plans:", error.message);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const planId = crypto.randomUUID();
    const planName = body.name || body.plan_name || "New Plan";
    const durationDays = body.durationDays !== undefined ? Number(body.durationDays) : (body.duration_days !== undefined ? Number(body.duration_days) : 30);
    const maxStudents = body.maxStudents !== undefined ? Number(body.maxStudents) : (body.max_students !== undefined ? Number(body.max_students) : 200);
    const maxInstructors = body.maxInstructors !== undefined ? Number(body.maxInstructors) : (body.max_instructors !== undefined ? Number(body.max_instructors) : 10);
    const price = Number(body.price || 0);
    const oldPrice = body.oldPrice ? Number(body.oldPrice) : (body.old_price ? Number(body.old_price) : null);
    const priceLabel = body.priceLabel || body.price_label || `৳${price.toLocaleString()}/month`;
    const duration = body.duration || (durationDays === 365 ? 'Yearly' : durationDays === 30 ? 'Monthly' : `${durationDays} Days`);
    const description = body.description || "";
    const features = JSON.stringify(Array.isArray(body.features) ? body.features : []);
    const isActive = Boolean(body.active ?? body.is_active ?? true);
    const popular = Boolean(body.popular ?? false);
    const badge = body.badge || null;
    const planTier = body.planTier || body.plan_tier || 'free';
    const planType = body.planType || body.plan_type || 'single_teacher';
    const maxBatches = body.maxBatches !== undefined ? Number(body.maxBatches) : (body.max_batches !== undefined ? Number(body.max_batches) : 1);
    const monthlyAiCredits = body.monthlyAiCredits !== undefined ? Number(body.monthlyAiCredits) : (body.monthly_ai_credits !== undefined ? Number(body.monthly_ai_credits) : 0);
    const showBranding = Boolean(body.showBranding ?? body.show_branding ?? true);
    const sortOrder = body.sortOrder !== undefined ? Number(body.sortOrder) : (body.sort_order !== undefined ? Number(body.sort_order) : 0);
    const featureGates = JSON.stringify(body.featureGates || body.feature_gates || {});

    await execute(
      `INSERT INTO plans 
       (id, plan_name, duration_days, max_students, max_instructors, price, old_price, price_label, duration, description, features, is_active, popular, badge, plan_tier, plan_type, max_batches, monthly_ai_credits, show_branding, sort_order, feature_gates) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        planId,
        planName,
        durationDays,
        maxStudents,
        maxInstructors,
        price,
        oldPrice,
        priceLabel,
        duration,
        description,
        features,
        isActive,
        popular,
        badge,
        planTier,
        planType,
        maxBatches,
        monthlyAiCredits,
        showBranding,
        sortOrder,
        featureGates,
      ]
    );

    const created = await queryOne("SELECT * FROM plans WHERE id = ?", [planId]);
    return NextResponse.json(mapPlanFromDb(created), { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
