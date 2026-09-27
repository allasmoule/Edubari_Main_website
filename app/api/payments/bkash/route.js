import { NextResponse } from "next/server";

/**
 * POST /api/payments/bkash — retired.
 *
 * It renewed a subscription for any transaction ID it was given, without asking bKash whether the
 * money had arrived. School ERP payments now go through POST /api/erp/v1/payments (signed by the
 * school's ERP), and are confirmed with bKash/Nagad in /api/payments/{bkash,nagad}/callback.
 */
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has been retired. Use POST /api/erp/v1/payments." },
    { status: 410 }
  );
}
