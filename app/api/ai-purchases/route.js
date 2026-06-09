import { NextResponse } from "next/server";
import { 
  getAiPurchaseRequests, 
  updatePurchaseRequestStatus, 
  getDomainBalances, 
  getDomainTransactions,
  getDomainCredits,
  createAiPurchaseRequest
} from "@/lib/ai-database";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dataType = searchParams.get("type"); // type: requests, balances, transactions, balance
  const domain = searchParams.get("domain");

  try {
    if (dataType === "balance" && domain) {
      let cleanDomain = domain.trim().toLowerCase();
      if (cleanDomain.includes("://")) {
        cleanDomain = cleanDomain.split("://")[1];
      }
      cleanDomain = cleanDomain.split("/")[0].split(":")[0];

      const data = await getDomainCredits(cleanDomain);
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

    if (requestId) {
      if (!status) {
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
    } else {
      // Creation path (e.g. from checkout manual payment submission)
      const { domain, packageId } = body;
      if (!domain || !packageId) {
        return NextResponse.json({ error: "Missing required fields: domain and packageId are required" }, { status: 400 });
      }

      const newRequest = await createAiPurchaseRequest(body);
      return NextResponse.json(newRequest, { status: 201 });
    }
  } catch (error) {
    console.error("Error in POST /api/ai-purchases:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
