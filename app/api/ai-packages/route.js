import { NextResponse } from "next/server";
import { getAiPackages, saveAiPackage } from "@/lib/ai-database";

export async function GET() {
  try {
    const data = await getAiPackages();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/ai-packages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, credits, price, validityDays, currency, isActive, highlight } = body;

    if (!name || credits === undefined || price === undefined || !validityDays) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const savedPkg = await saveAiPackage({
      id,
      name,
      credits: Number(credits),
      price: Number(price),
      validityDays: Number(validityDays),
      currency: currency || "BDT",
      isActive: isActive !== false,
      highlight: !!highlight,
    });

    return NextResponse.json({
      message: "Package saved successfully.",
      package: savedPkg,
    });
  } catch (error) {
    console.error("Error in POST /api/ai-packages:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
