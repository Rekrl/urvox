import { randomUUID } from "crypto";
import { appendLedgerBlock } from "./ledger";
import { getStore } from "./store";
import type {
  AirStation,
  Bin,
  LedgerBlock,
  NewsItem,
  Report,
  ReportCategory,
  Streetlight,
  TrafficRoute,
  WorkOrder,
  Zone,
} from "./types";

const TICK_MS = 4000;
const REPORT_IN_PROGRESS_AFTER_MS = 15_000;
const REPORT_RESOLVED_AFTER_MS = 30_000;

const SEED_BINS: Array<Pick<Bin, "id" | "name" | "zone" | "x" | "y">> = [
  { id: "b01", name: "Rua das Flores 12", zone: "A", x: 14, y: 18 },
  { id: "b02", name: "Praca do Comercio", zone: "A", x: 30, y: 12 },
  { id: "b03", name: "Avenida Central", zone: "A", x: 22, y: 28 },
  { id: "b04", name: "Rua do Mercado", zone: "A", x: 40, y: 22 },
  { id: "b05", name: "Largo da Se", zone: "A", x: 10, y: 35 },
  { id: "b06", name: "Rua Nova", zone: "A", x: 34, y: 38 },
  { id: "b07", name: "Avenida Marginal", zone: "A", x: 46, y: 14 },
  { id: "b08", name: "Rua do Comercio", zone: "A", x: 18, y: 44 },
  { id: "b09", name: "Rua dos Lirios", zone: "B", x: 58, y: 58 },
  { id: "b10", name: "Travessa do Sol", zone: "B", x: 72, y: 52 },
  { id: "b11", name: "Rua da Escola", zone: "B", x: 64, y: 70 },
  { id: "b12", name: "Rua das Acacias", zone: "B", x: 84, y: 60 },
  { id: "b13", name: "Bairro Verde", zone: "B", x: 54, y: 80 },
  { id: "b14", name: "Rua do Pinhal", zone: "B", x: 90, y: 78 },
  { id: "b15", name: "Rua da Quinta", zone: "B", x: 76, y: 86 },
  { id: "b16", name: "Estrada Municipal", zone: "B", x: 62, y: 92 },
];

const SEED_STREETLIGHTS: Array<Pick<Streetlight, "id" | "name" | "zone" | "x" | "y">> = [
  { id: "l01", name: "Poste 12 — Rua das Flores", zone: "A", x: 20, y: 14 },
  { id: "l02", name: "Poste 3 — Praca do Comercio", zone: "A", x: 36, y: 10 },
  { id: "l03", name: "Poste 27 — Avenida Central", zone: "A", x: 16, y: 30 },
  { id: "l04", name: "Poste 8 — Largo da Se", zone: "A", x: 6, y: 40 },
  { id: "l05", name: "Poste 41 — Rua do Comercio", zone: "A", x: 24, y: 46 },
  { id: "l06", name: "Poste 5 — Rua dos Lirios", zone: "B", x: 62, y: 54 },
  { id: "l07", name: "Poste 19 — Travessa do Sol", zone: "B", x: 78, y: 48 },
  { id: "l08", name: "Poste 33 — Rua da Escola", zone: "B", x: 60, y: 74 },
  { id: "l09", name: "Poste 2 — Bairro Verde", zone: "B", x: 50, y: 84 },
  { id: "l10", name: "Poste 14 — Rua da Quinta", zone: "B", x: 80, y: 88 },
];

const SEED_AIR_STATIONS: Array<Pick<AirStation, "id" | "name" | "zone" | "x" | "y">> = [
  { id: "ar01", name: "Estacao Centro (Zona A)", zone: "A", x: 26, y: 24 },
  { id: "ar02", name: "Estacao Suburbio (Zona B)", zone: "B", x: 68, y: 66 },
];

const SEED_TRAFFIC_ROUTES: Array<Pick<TrafficRoute, "id" | "name" | "zone">> = [
  { id: "tr01", name: "Avenida Central", zone: "A" },
  { id: "tr02", name: "Avenida Marginal", zone: "A" },
  { id: "tr03", name: "Rua do Mercado", zone: "A" },
  { id: "tr04", name: "Travessa do Sol", zone: "B" },
  { id: "tr05", name: "Estrada Municipal", zone: "B" },
  { id: "tr06", name: "Rua da Escola", zone: "B" },
];

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

const SEED_NEWS: Array<Omit<NewsItem, "id" | "createdAt">> = [
  {
    title: "Rua do Mercado cortada ao transito",
    category: "obra",
    description: "Obras de repavimentacao. Transito condicionado no sentido centro-suburbio.",
    zone: "A",
    startDate: daysFromNow(-2),
    endDate: daysFromNow(2),
  },
  {
    title: "Manutencao de iluminacao publica — Zona A",
    category: "obra",
    description: "Equipas municipais a substituir luminarias antigas por LED em varias ruas do centro.",
    zone: "A",
    startDate: daysFromNow(0),
    endDate: daysFromNow(1),
  },
  {
    title: "Feira de S. Mateus",
    category: "evento",
    description: "Feira anual com artesanato, gastronomia e musica ao vivo, na Praca do Comercio.",
    zone: "todas",
    startDate: daysFromNow(9),
    endDate: daysFromNow(12),
  },
  {
    title: "Sessao publica — Orcamento Participativo 2027",
    category: "evento",
    description: "Apresentacao e discussao das propostas recebidas para o orcamento do proximo ano.",
    zone: "todas",
    startDate: daysFromNow(17),
    endDate: daysFromNow(17),
  },
  {
    title: "Recolha extraordinaria de monos — Zona B",
    category: "aviso",
    description: "Recolha de moveis e eletrodomesticos fora de uso. Colocar na rua ate as 8h.",
    zone: "B",
    startDate: daysFromNow(-6),
    endDate: daysFromNow(-6),
  },
];

function statusForLevel(level: number): Bin["status"] {
  if (level >= 85) return "critical";
  if (level >= 60) return "warning";
  return "ok";
}

function statusForPm25(pm25: number): AirStation["status"] {
  if (pm25 >= 40) return "critical";
  if (pm25 >= 20) return "warning";
  return "ok";
}

function statusForCongestion(congestion: number): TrafficRoute["status"] {
  if (congestion >= 70) return "critical";
  if (congestion >= 30) return "warning";
  return "ok";
}

function seedBins(): Bin[] {
  const now = Date.now();
  return SEED_BINS.map((seed, i) => {
    const level = 15 + Math.round(Math.abs(Math.sin(i * 12.9898) * 43));
    return {
      ...seed,
      level,
      status: statusForLevel(level),
      capacityL: 1100,
      lastCollection: new Date(now - (i % 5) * 86_400_000).toISOString(),
      history: [level],
      loggedCritical: false,
    };
  });
}

function seedStreetlights(): Streetlight[] {
  const now = new Date().toISOString();
  return SEED_STREETLIGHTS.map((seed) => ({
    ...seed,
    status: "ok",
    lastChecked: now,
  }));
}

function seedAirStations(): AirStation[] {
  return SEED_AIR_STATIONS.map((seed, i) => {
    const pm25 = 10 + i * 4;
    return {
      ...seed,
      pm25,
      status: statusForPm25(pm25),
      history: [pm25],
      loggedCritical: false,
    };
  });
}

function seedTrafficRoutes(): TrafficRoute[] {
  return SEED_TRAFFIC_ROUTES.map((seed, i) => {
    const congestion = 15 + i * 6;
    return {
      ...seed,
      status: statusForCongestion(congestion),
      etaDeltaMin: Math.round(congestion / 12),
      history: [congestion],
    };
  });
}

function seedNews(): NewsItem[] {
  const now = new Date().toISOString();
  return SEED_NEWS.map((item) => ({ ...item, id: randomUUID(), createdAt: now }));
}

function tick() {
  const store = getStore();

  for (const bin of store.bins) {
    if (bin.level < 100) {
      const growth = 2 + Math.random() * 6;
      bin.level = Math.min(100, Math.round(bin.level + growth));
    }

    if (bin.level >= 75 && Math.random() < 0.3) {
      const previousLevel = bin.level;
      bin.level = 5 + Math.round(Math.random() * 10);
      bin.lastCollection = new Date().toISOString();
      bin.loggedCritical = false;
      appendLedgerBlock(
        "recolha",
        `Recolha efetuada em ${bin.name} (Zona ${bin.zone})`,
        { binId: bin.id, zone: bin.zone, previousLevel }
      );
    }

    bin.status = statusForLevel(bin.level);
    bin.history = [...bin.history, bin.level].slice(-14);

    if (bin.status === "critical" && !bin.loggedCritical) {
      bin.loggedCritical = true;
      appendLedgerBlock(
        "contentor_critico",
        `${bin.name} (Zona ${bin.zone}) atingiu ${bin.level}% de enchimento`,
        { binId: bin.id, zone: bin.zone, level: bin.level }
      );
    }
  }

  for (const station of store.airStations) {
    const delta = (Math.random() - 0.45) * 6;
    station.pm25 = Math.min(80, Math.max(3, Math.round(station.pm25 + delta)));
    station.status = statusForPm25(station.pm25);
    station.history = [...station.history, station.pm25].slice(-14);

    if (station.status === "critical" && !station.loggedCritical) {
      station.loggedCritical = true;
      appendLedgerBlock(
        "ar_critico",
        `${station.name} registou qualidade do ar critica (PM2.5 ${station.pm25})`,
        { stationId: station.id, zone: station.zone, pm25: station.pm25 }
      );
    } else if (station.status !== "critical") {
      station.loggedCritical = false;
    }
  }

  for (const route of store.trafficRoutes) {
    const last = route.history[route.history.length - 1] ?? 30;
    const delta = (Math.random() - 0.5) * 18;
    const congestion = Math.min(100, Math.max(0, Math.round(last + delta)));
    route.status = statusForCongestion(congestion);
    route.etaDeltaMin = Math.round(congestion / 12);
    route.history = [...route.history, congestion].slice(-14);
  }

  const now = Date.now();
  for (const report of store.reports) {
    const age = now - new Date(report.createdAt).getTime();
    const sinceUpdate = now - new Date(report.updatedAt).getTime();

    if (report.status === "submetido" && age >= REPORT_IN_PROGRESS_AFTER_MS) {
      report.status = "em_curso";
      report.updatedAt = new Date().toISOString();
      appendLedgerBlock(
        "reporte_em_curso",
        `Reporte ${report.id.slice(0, 8)} passou a "em curso" (Zona ${report.zone})`,
        { reportId: report.id, zone: report.zone, category: report.category }
      );
    } else if (
      report.status === "em_curso" &&
      sinceUpdate >= REPORT_RESOLVED_AFTER_MS
    ) {
      report.status = "resolvido";
      report.updatedAt = new Date().toISOString();

      if (report.category === "poste_avariado") {
        report.photo = null;
        const light = store.streetlights.find((l) => l.id === report.streetlightId);
        if (light) {
          light.status = "ok";
          light.lastChecked = report.updatedAt;
        }
        appendLedgerBlock(
          "poste_reparado",
          `Poste reparado (Zona ${report.zone})`,
          { reportId: report.id, zone: report.zone }
        );
      } else {
        appendLedgerBlock(
          "reporte_resolvido",
          `Reporte ${report.id.slice(0, 8)} foi resolvido (Zona ${report.zone})`,
          { reportId: report.id, zone: report.zone, category: report.category }
        );
      }
    }
  }
}

export function startSimulator() {
  const store = getStore();

  if (store.bins.length === 0) store.bins = seedBins();
  if (store.streetlights.length === 0) store.streetlights = seedStreetlights();
  if (store.airStations.length === 0) store.airStations = seedAirStations();
  if (store.trafficRoutes.length === 0) store.trafficRoutes = seedTrafficRoutes();
  if (store.newsItems.length === 0) store.newsItems = seedNews();

  if (!store.simulatorStarted) {
    store.simulatorStarted = true;
    setInterval(tick, TICK_MS);
  }
}

export function getBins(): Bin[] {
  startSimulator();
  return getStore().bins;
}

export function getStreetlights(): Streetlight[] {
  startSimulator();
  return getStore().streetlights;
}

export function getAirStations(): AirStation[] {
  startSimulator();
  return getStore().airStations;
}

export function getTrafficRoutes(): TrafficRoute[] {
  startSimulator();
  return getStore().trafficRoutes;
}

export function getNews(): NewsItem[] {
  startSimulator();
  return getStore().newsItems;
}

export function getWorkOrders(): WorkOrder[] {
  startSimulator();
  return getStore().workOrders;
}

export function getReports(): Report[] {
  startSimulator();
  return getStore().reports;
}

export function getLedger(): LedgerBlock[] {
  startSimulator();
  return getStore().ledger;
}

export function workOrderStatus(report: Report): "aberta" | "em_execucao" | "concluida" {
  if (report.status === "submetido") return "aberta";
  if (report.status === "em_curso") return "em_execucao";
  return "concluida";
}

export function createReport(input: {
  citizen: string;
  zone: Zone;
  category: ReportCategory;
  description: string;
  binId: string | null;
  streetlightId: string | null;
  photo: string | null;
}): Report {
  startSimulator();
  const store = getStore();
  const now = new Date().toISOString();
  const report: Report = {
    id: randomUUID(),
    citizen: input.citizen,
    zone: input.zone,
    category: input.category,
    description: input.description,
    binId: input.binId,
    streetlightId: input.streetlightId,
    photo: input.photo,
    status: "submetido",
    createdAt: now,
    updatedAt: now,
  };
  store.reports.unshift(report);

  if (input.category === "poste_avariado") {
    if (input.streetlightId) {
      const light = store.streetlights.find((l) => l.id === input.streetlightId);
      if (light) light.status = "critical";
    }

    const reference = `OS-2026-${String(store.workOrders.length + 1).padStart(4, "0")}`;
    store.workOrders.push({
      id: randomUUID(),
      reference,
      reportId: report.id,
      streetlightId: input.streetlightId,
      createdAt: now,
    });

    appendLedgerBlock(
      "poste_reportado",
      `Novo reporte de iluminacao na Zona ${input.zone}`,
      { reportId: report.id, zone: input.zone, category: input.category }
    );
  } else {
    appendLedgerBlock(
      "reporte_criado",
      `Novo reporte "${categoryLabel(input.category)}" na Zona ${input.zone}`,
      { reportId: report.id, zone: input.zone, category: input.category }
    );
  }

  return report;
}

export function categoryLabel(category: ReportCategory): string {
  switch (category) {
    case "contentor_cheio":
      return "Contentor cheio";
    case "contentor_danificado":
      return "Contentor danificado";
    case "falta_recolha":
      return "Falta de recolha";
    case "poste_avariado":
      return "Poste de iluminação avariado";
    default:
      return "Outro";
  }
}
