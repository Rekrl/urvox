import { NextResponse } from "next/server";
import { verifyLedger } from "@/lib/ledger";
import { getLedger } from "@/lib/simulator";

export async function GET() {
  const blocks = getLedger();
  const verification = verifyLedger();
  return NextResponse.json({ blocks: [...blocks].reverse(), verification });
}
