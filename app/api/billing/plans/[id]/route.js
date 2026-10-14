import { NextResponse } from "next/server";
import { execute, queryOne, isForeignKeyViolation, isCheckViolation } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { invalidatePlansCache } from "@/lib/plansCache";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      plan_name, duration_days, max_students, max_instructors, price, features,
      plan_tier, plan_type, max_batches, monthly_ai_credits, show_branding, is_active,
      sort_order, feature_gates, old_price, price_label, duration, description,
      popular, badge,
    } = body;

    const setClauses = [];
    const values = [];

    if (plan_name !== undefined) { setClauses.push("plan_name = ?"); values.push(plan_name); }
    if (duration_days !== undefined) { setClauses.push("duration_days = ?"); values.push(Number(duration_days)); }
    if (max_students !== undefined) { setClauses.push("max_students = ?"); values.push(Number(max_students)); }
    if (max_instructors !== undefined) { setClauses.push("max_instructors = ?"); values.push(Number(max_instructors)); }
    if (price !== undefined) { setClauses.push("price = ?"); values.push(Number(price)); }
    if (features !== undefined) { setClauses.push("features = ?"); values.push(JSON.stringify(Array.isArray(features) ? features : [])); }
    if (plan_tier !== undefined) { setClauses.push("plan_tier = ?"); values.push(plan_tier); }
    if (plan_type !== undefined) { setClauses.push("plan_type = ?"); values.push(plan_type); }
    if (max_batches !== undefined) { setClauses.push("max_batches = ?"); values.push(Number(max_batches)); }
    if (monthly_ai_credits !== undefined) { setClauses.push("monthly_ai_credits = ?"); values.push(Number(monthly_ai_credits)); }
    if (show_branding !== undefined) { setClauses.push("show_branding = ?"); values.push(Boolean(show_branding)); }
    if (is_active !== undefined) { setClauses.push("is_active = ?"); values.push(Boolean(is_active)); }
    if (sort_order !== undefined) { setClauses.push("sort_order = ?"); values.push(Number(sort_order)); }
    if (feature_gates !== undefined) { setClauses.push("feature_gates = ?"); values.push(JSON.stringify(feature_gates || {})); }
    if (old_price !== undefined) { setClauses.push("old_price = ?"); values.push(old_price !== null && old_price !== "" ? Number(old_price) : null); }
    if (price_label !== undefined) { setClauses.push("price_label = ?"); values.push(price_label); }
    if (duration !== undefined) { setClauses.push("duration = ?"); values.push(duration); }
    if (description !== undefined) { setClauses.push("description = ?"); values.push(description); }
    if (popular !== undefined) { setClauses.push("popular = ?"); values.push(Boolean(popular)); }
    if (badge !== undefined) { setClauses.push("badge = ?"); values.push(badge); }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const updated = await queryOne(`UPDATE plans SET ${setClauses.join(", ")} WHERE id = ? RETURNING *`, values);
    if (!updated) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    invalidatePlansCache();
    return NextResponse.json(updated);
  } catch (error) {
    if (isCheckViolation(error)) {
      return NextResponse.json({ error: "Invalid plan value" }, { status: 400 });
    }
    console.error("Error updating plan:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    await execute("DELETE FROM plans WHERE id = ?", [id]);
    invalidatePlansCache();
    return NextResponse.json({ message: "Plan deleted successfully" });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return NextResponse.json({
        error: "This plan cannot be deleted because active client subscriptions reference it. Please suspend subscriptions or change their plan first.",
      }, { status: 400 });
    }
    console.error("Error deleting plan:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
