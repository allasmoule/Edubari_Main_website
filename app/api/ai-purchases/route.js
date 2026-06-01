import { NextResponse } from "next/server";
import { 
  getAiPurchaseRequests, 
  updatePurchaseRequestStatus, 
  getDomainBalances, 
  getDomainTransactions,
  getDomainCredits
} from "@/lib/ai-database";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dataType = searchParams.get("type"); // type: requests, balances, transactions, balance
  const domain = searchParams.get("domain");

  try {
    if (dataType === "balance" && domain) {
      const data = await getDomainCredits(domain);
      return NextResponse.json(data);
    } else if (dataType === "balances") {
      const data = await getDomainBalances();
      return NextResponse.json(data);
    } else if (dataType === "transactions") {
      const data = await getDomainTransactions();
      return NextResponse.json(data);
    }

    // Default to purchase requests
    const data = await getAiPurchaseRequests();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/ai-purchases:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { requestId, status, reason } = body;

    if (!requestId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updatedRequest = await updatePurchaseRequestStatus(requestId, status, reason);
    return NextResponse.json({
      message: `Purchase request ${status} successfully.`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error in POST /api/ai-purchases:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
