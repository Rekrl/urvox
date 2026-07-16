import { NextResponse } from "next/server";
import { getNews } from "@/lib/simulator";

export async function GET() {
  const items = [...getNews()].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  return NextResponse.json({ items });
}
