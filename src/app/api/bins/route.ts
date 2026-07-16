import { NextResponse } from "next/server";
import { getBins } from "@/lib/simulator";

export async function GET() {
  return NextResponse.json({ bins: getBins() });
}
