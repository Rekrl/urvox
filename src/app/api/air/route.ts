import { NextResponse } from "next/server";
import { getAirStations } from "@/lib/simulator";

export async function GET() {
  return NextResponse.json({ stations: getAirStations() });
}
