import { NextResponse } from "next/server";
import { getStreetlights, getWorkOrders } from "@/lib/simulator";

export async function GET() {
  return NextResponse.json({
    streetlights: getStreetlights(),
    workOrders: getWorkOrders(),
  });
}
