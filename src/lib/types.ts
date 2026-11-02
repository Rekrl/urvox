export type Zone = "A" | "B";

export type BinStatus = "ok" | "warning" | "critical";

/** Same three-tier status used across every simulated asset (bins, streetlights,
 * air stations, traffic routes) so the UI can share one badge/palette. */
export type AssetStatus = BinStatus;

export type Bin = {
  id: string;
  name: string;
  zone: Zone;
  lat: number; // WGS84 — real position in Viseu (OpenStreetMap)
  lng: number;
  level: number; // 0-100 fill percentage
  status: AssetStatus;
  capacityL: number;
  lastCollection: string; // ISO date
  history: number[]; // recent fill readings, oldest first
  loggedCritical: boolean;
};

export type Streetlight = {
  id: string;
  name: string;
  zone: Zone;
  lat: number;
  lng: number;
  status: AssetStatus; // ok | warning (a piscar) | critical (avariado)
  lastChecked: string; // ISO date
};

export type WorkOrder = {
  id: string;
  reference: string; // e.g. "OS-2026-0001"
  reportId: string;
  streetlightId: string | null;
  createdAt: string;
};

export type AirStation = {
  id: string;
  name: string;
  zone: Zone;
  lat: number;
  lng: number;
  pm25: number;
  status: AssetStatus; // boa | moderada | má
  history: number[];
  loggedCritical: boolean;
};

export type TrafficRoute = {
  id: string;
  name: string;
  zone: Zone;
  status: AssetStatus; // fluido | moderado | congestionado
  etaDeltaMin: number;
  history: number[]; // congestion 0-100
};

export type NewsCategory = "obra" | "evento" | "aviso";

export type NewsItem = {
  id: string;
  title: string;
  category: NewsCategory;
  description: string;
  zone: Zone | "todas";
  startDate: string; // ISO date
  endDate: string; // ISO date
  createdAt: string;
};

export type ReportCategory =
  | "contentor_cheio"
  | "contentor_danificado"
  | "falta_recolha"
  | "poste_avariado"
  | "outro";

export type ReportStatus = "submetido" | "em_curso" | "resolvido";

export type Report = {
  id: string;
  citizen: string;
  zone: Zone;
  category: ReportCategory;
  description: string;
  binId: string | null;
  streetlightId: string | null;
  photo: string | null; // base64 data URL, cleared once resolved
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
};

export type LedgerEventType =
  | "contentor_critico"
  | "recolha"
  | "reporte_criado"
  | "reporte_em_curso"
  | "reporte_resolvido"
  | "poste_reportado"
  | "poste_reparado"
  | "ar_critico";

export type LedgerBlock = {
  index: number;
  timestamp: string;
  type: LedgerEventType;
  summary: string;
  data: Record<string, unknown>;
  prevHash: string;
  hash: string;
};
