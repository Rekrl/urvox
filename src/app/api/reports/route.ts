import { NextRequest, NextResponse } from "next/server";
import { createReport, getReports } from "@/lib/simulator";
import type { ReportCategory, Zone } from "@/lib/types";

const VALID_CATEGORIES: ReportCategory[] = [
  "contentor_cheio",
  "contentor_danificado",
  "falta_recolha",
  "poste_avariado",
  "outro",
];
const VALID_ZONES: Zone[] = ["A", "B"];

// ~3MB image as a base64 data URL, plus headroom for the "data:image/...;base64," prefix.
const MAX_PHOTO_LENGTH = 4_200_000;

export async function GET(request: NextRequest) {
  const citizen = request.nextUrl.searchParams.get("citizen");
  const reports = getReports();
  const filtered = citizen
    ? reports.filter((r) => r.citizen === citizen)
    : reports;
  return NextResponse.json({ reports: filtered });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.citizen !== "string" || !body.citizen.trim()) {
    return NextResponse.json({ error: "Nome do cidadão em falta." }, { status: 400 });
  }
  if (!VALID_ZONES.includes(body.zone)) {
    return NextResponse.json({ error: "Zona inválida." }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(body.category)) {
    return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
  }
  if (typeof body.description !== "string" || !body.description.trim()) {
    return NextResponse.json({ error: "Descrição em falta." }, { status: 400 });
  }
  if (body.photo != null) {
    if (typeof body.photo !== "string" || !body.photo.startsWith("data:image/")) {
      return NextResponse.json({ error: "Foto inválida." }, { status: 400 });
    }
    if (body.photo.length > MAX_PHOTO_LENGTH) {
      return NextResponse.json({ error: "Foto demasiado grande (máx. ~3MB)." }, { status: 400 });
    }
  }

  const report = createReport({
    citizen: body.citizen.trim(),
    zone: body.zone,
    category: body.category,
    description: body.description.trim().slice(0, 500),
    binId: typeof body.binId === "string" ? body.binId : null,
    streetlightId: typeof body.streetlightId === "string" ? body.streetlightId : null,
    photo: typeof body.photo === "string" ? body.photo : null,
  });

  return NextResponse.json({ report }, { status: 201 });
}
