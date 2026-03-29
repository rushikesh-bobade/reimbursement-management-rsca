export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAvailableCurrencies } from "@/lib/currency";

export async function GET() {
  try {
    const currencies = await getAvailableCurrencies();
    return NextResponse.json({ currencies });
  } catch (error) {
    console.error("GET /api/currencies error:", error);
    return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 });
  }
}
