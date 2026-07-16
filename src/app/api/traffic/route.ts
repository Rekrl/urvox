import { NextResponse } from "next/server";
import { getTrafficRoutes } from "@/lib/simulator";

export async function GET() {
  return NextResponse.json({ routes: getTrafficRoutes() });
}
