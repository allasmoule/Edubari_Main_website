import { NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { invalidatePlansCache } from "@/lib/plansCache";

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

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const row = await queryOne("SELECT * FROM plans WHERE id = ?", [id]);
    if (!row) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    return NextResponse.json(mapPlanFromDb(row));
  } catch (error) {
    console.error("Error fetching plan:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await queryOne("SELECT * FROM plans WHERE id = ?", [id]);
    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const updates = [];
    const values = [];

    if (body.name !== undefined || body.plan_name !== undefined) {
      updates.push("plan_name = ?");
      values.push(body.name || body.plan_name);
    }
    if (body.price !== undefined) {
      updates.push("price = ?");
      values.push(Number(body.price));
    }
    if (body.oldPrice !== undefined || body.old_price !== undefined) {
      updates.push("old_price = ?");
      const val = body.oldPrice !== undefined ? body.oldPrice : body.old_price;
      values.push(val ? Number(val) : null);
    }
    if (body.priceLabel !== undefined || body.price_label !== undefined) {
      updates.push("price_label = ?");
      values.push(body.priceLabel || body.price_label || null);
    }
    if (body.duration !== undefined) {
      updates.push("duration = ?");
      values.push(body.duration);
    }
    if (body.description !== undefined) {
      updates.push("description = ?");
      values.push(body.description);
    }
    if (body.features !== undefined) {
      updates.push("features = ?");
      values.push(JSON.stringify(Array.isArray(body.features) ? body.features : []));
    }
    if (body.active !== undefined || body.is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(Boolean(body.active ?? body.is_active));
    }
    if (body.popular !== undefined) {
      updates.push("popular = ?");
      values.push(Boolean(body.popular));
    }
    if (body.badge !== undefined) {
      updates.push("badge = ?");
      values.push(body.badge || null);
    }
    if (body.planTier !== undefined || body.plan_tier !== undefined) {
      updates.push("plan_tier = ?");
      values.push(body.planTier || body.plan_tier);
    }
    if (body.planType !== undefined || body.plan_type !== undefined) {
      updates.push("plan_type = ?");
      values.push(body.planType || body.plan_type);
    }
    if (body.maxStudents !== undefined || body.max_students !== undefined) {
      updates.push("max_students = ?");
      values.push(Number(body.maxStudents !== undefined ? body.maxStudents : body.max_students));
    }
    if (body.maxInstructors !== undefined || body.max_instructors !== undefined) {
      updates.push("max_instructors = ?");
      values.push(Number(body.maxInstructors !== undefined ? body.maxInstructors : body.max_instructors));
    }
    if (body.maxBatches !== undefined || body.max_batches !== undefined) {
      updates.push("max_batches = ?");
      values.push(Number(body.maxBatches !== undefined ? body.maxBatches : body.max_batches));
    }
    if (body.monthlyAiCredits !== undefined || body.monthly_ai_credits !== undefined) {
      updates.push("monthly_ai_credits = ?");
      values.push(Number(body.monthlyAiCredits !== undefined ? body.monthlyAiCredits : body.monthly_ai_credits));
    }
    if (body.showBranding !== undefined || body.show_branding !== undefined) {
      updates.push("show_branding = ?");
      values.push(Boolean(body.showBranding ?? body.show_branding));
    }
    if (body.sortOrder !== undefined || body.sort_order !== undefined) {
      updates.push("sort_order = ?");
      values.push(Number(body.sortOrder !== undefined ? body.sortOrder : body.sort_order));
    }
    if (body.featureGates !== undefined || body.feature_gates !== undefined) {
      updates.push("feature_gates = ?");
      values.push(JSON.stringify(body.featureGates || body.feature_gates || {}));
    }
    if (body.durationDays !== undefined || body.duration_days !== undefined) {
      updates.push("duration_days = ?");
      values.push(Number(body.durationDays !== undefined ? body.durationDays : body.duration_days));
    }

    if (updates.length > 0) {
      values.push(id);
      await execute(`UPDATE plans SET ${updates.join(", ")} WHERE id = ?`, values);
    }

    invalidatePlansCache();
    const updatedRow = await queryOne("SELECT * FROM plans WHERE id = ?", [id]);
    return NextResponse.json({ message: "Plan updated", plan: mapPlanFromDb(updatedRow) });
  } catch (error) {
    console.error("Error updating plan:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    await execute("DELETE FROM plans WHERE id = ?", [id]);
    invalidatePlansCache();
    return NextResponse.json({ message: "Plan deleted" });
  } catch (error) {
    console.error("Error deleting plan:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
