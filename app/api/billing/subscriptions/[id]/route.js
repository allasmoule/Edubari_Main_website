import { NextResponse } from "next/server";
import { execute, withTransaction, isCheckViolation } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { subscriptionWithRelations } from "@/lib/subscription-billing";

function validDate(value) {
  return value !== null && !Number.isNaN(new Date(value).getTime());
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { start_date, end_date, grace_end_date, is_current, payment_status } = body;

    for (const [name, value] of Object.entries({ start_date, end_date, grace_end_date })) {
      if (value !== undefined && !validDate(value)) {
        return NextResponse.json({ error: `${name} is not a valid date` }, { status: 400 });
      }
    }

    const setClauses = [];
    const values = [];
    if (start_date !== undefined) { setClauses.push("start_date = ?"); values.push(new Date(start_date)); }
    if (end_date !== undefined) { setClauses.push("end_date = ?"); values.push(new Date(end_date)); }
    if (grace_end_date !== undefined) { setClauses.push("grace_end_date = ?"); values.push(new Date(grace_end_date)); }
    if (is_current !== undefined) { setClauses.push("is_current = ?"); values.push(Boolean(is_current)); }
    if (payment_status !== undefined) { setClauses.push("payment_status = ?"); values.push(payment_status); }

    const updated = await withTransaction(async (tx) => {
      const current = await tx.queryOne("SELECT client_id FROM subscriptions WHERE id = ? FOR UPDATE", [id]);
      if (!current) return null;

      // Making this one current switches the others off in the same transaction
      if (is_current === true) {
        await tx.execute("UPDATE subscriptions SET is_current = FALSE WHERE client_id = ? AND id <> ? AND is_current", [
          current.client_id,
          id,
        ]);
      }
      if (setClauses.length > 0) {
        await tx.execute(`UPDATE subscriptions SET ${setClauses.join(", ")} WHERE id = ?`, [...values, id]);
      }
      // Same shape as GET /api/billing/subscriptions (client and plan nested)
      return subscriptionWithRelations(tx, id);
    });

    if (!updated) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    if (isCheckViolation(error)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }
    console.error("Error updating subscription:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    await execute("DELETE FROM subscriptions WHERE id = ?", [id]);
    return NextResponse.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
