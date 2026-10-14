import { NextResponse } from "next/server";
import {
  getAiPackages,
  getAiPurchaseRequests,
  updatePurchaseRequestStatus,
  getDomainBalances,
  getDomainTransactions,
  getDomainCredits,
  createAiPurchaseRequest
} from "@/lib/ai-database";
import { requireAdmin } from "@/lib/auth";
import { cleanDomain } from "@/lib/safe-redirect";
import { sendOrderNotificationEmail } from "@/lib/email";
import { isUniqueViolation } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dataType = searchParams.get("type"); // type: requests, balances, transactions, balance
  const domain = searchParams.get("domain");

  try {
    // One domain's own balance is public (shown to the institution); everything else is admin-only
    if (dataType === "balance" && domain) {
      const data = await getDomainCredits(cleanDomain(domain));
      return NextResponse.json(data);
    }

    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;

    if (dataType === "balances") {
      return NextResponse.json(await getDomainBalances());
    } else if (dataType === "transactions") {
      return NextResponse.json(await getDomainTransactions());
    }
    return NextResponse.json(await getAiPurchaseRequests());
  } catch (error) {
    console.error("Error in GET /api/ai-purchases:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { requestId, status, reason } = body;

    if (requestId) {
      // Approving / rejecting (which adds credits) is for a signed-in admin only
      const auth = await requireAdmin(request);
      if (auth.response) return auth.response;

      if (status !== "approved" && status !== "rejected") {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }

      const updatedRequest = await updatePurchaseRequestStatus(requestId, status, reason);
      return NextResponse.json({
        message: `Purchase request ${status} successfully.`,
        request: updatedRequest,
      });
    }

    // Public creation path (manual bKash/Nagad payment from the checkout page): always pending,
    // and the credits/price come from the package on the server — never from the browser
    const domain = cleanDomain(body.domain);
    const transactionId = String(body.transactionId || "").trim();
    if (!domain || !body.packageId || !transactionId) {
      return NextResponse.json({ error: "Missing required fields: domain, packageId and transactionId are required" }, { status: 400 });
    }
    const pkg = (await getAiPackages()).find((p) => p.id === body.packageId && p.isActive !== false);
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const newRequest = await createAiPurchaseRequest({
      domain,
      userName: String(body.userName || "").slice(0, 255) || undefined,
      userPhone: String(body.userPhone || "").slice(0, 50) || undefined,
      packageId: pkg.id,
      packageName: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
      currency: pkg.currency || "BDT",
      paymentMethod: ["bkash", "nagad"].includes(body.paymentMethod) ? body.paymentMethod : "manual",
      transactionId: transactionId.slice(0, 100),
      status: "pending",
    });

    // Notify Admin & CC via Email
    sendOrderNotificationEmail({
      institutionName: domain,
      fullName: body.userName || "Customer",
      email: body.email || "",
      phone: body.userPhone || "",
      preferredDomain: domain,
      selectedPlanName: `${pkg.name} (${pkg.credits} AI Credits)`,
      selectedPlanDuration: `${pkg.validityDays || 30} Days`,
      selectedPlanPrice: pkg.price,
      paymentMethod: `${body.paymentMethod || "Gateway"} (TrxID: ${transactionId})`,
      subscriptionId: newRequest?.id || transactionId,
    }).catch((emailErr) => {
      console.error("AI purchase email send error:", emailErr);
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "This transaction ID has already been submitted" }, { status: 409 });
    }
    console.error("Error in POST /api/ai-purchases:", error.message);
    const known = /already processed|not found/i.test(error.message);
    return NextResponse.json({ error: known ? error.message : "Internal Server Error" }, { status: known ? 409 : 500 });
  }
}
