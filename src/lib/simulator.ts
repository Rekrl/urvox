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

// Positions are real: bins are OpenStreetMap ecopontos/contentores
// (amenity=recycling|waste_disposal) in Viseu's historic centre, clustered and
// named after the nearest street. Streetlights mix OSM street_lamp nodes with
// points on real streets. Readings stay simulated — only geography is real.
// Zone A = Centro Histórico (Sé, north), Zone B = Rossio / Baixa (south).
const SEED_BINS: Array<Pick<Bin, "id" | "name" | "zone" | "lat" | "lng">> = [
  { id: "b01", name: "Ecoponto Rua Serpa Pinto", zone: "A", lat: 40.662394, lng: -7.90988 },
  { id: "b02", name: "Ecoponto Travessa do Orfeão", zone: "A", lat: 40.662057, lng: -7.911895 },
  { id: "b03", name: "Ecoponto Rua Bombeiros Voluntários", zone: "A", lat: 40.661343, lng: -7.917279 },
  { id: "b04", name: "Ecoponto Largo Mouzinho de Albuquerque", zone: "A", lat: 40.660488, lng: -7.908573 },
  { id: "b05", name: "Ecoponto Travessa da Misericórdia", zone: "A", lat: 40.660433, lng: -7.912124 },
  { id: "b06", name: "Ecoponto Av. Dr. António José de Almeida", zone: "A", lat: 40.660168, lng: -7.91544 },
  { id: "b07", name: "Ecoponto Rua do Comércio", zone: "A", lat: 40.659114, lng: -7.911968 },
  { id: "b08", name: "Ecoponto Rua 21 de Agosto", zone: "A", lat: 40.659001, lng: -7.915617 },
  { id: "b09", name: "Ecoponto Largo Major Teles", zone: "B", lat: 40.658432, lng: -7.913669 },
  { id: "b10", name: "Ecoponto Rua da Árvore", zone: "B", lat: 40.658362, lng: -7.910541 },
  { id: "b11", name: "Ecoponto Avenida Alberto Sampaio", zone: "B", lat: 40.657956, lng: -7.916599 },
  { id: "b12", name: "Ecoponto Rua da Vitória", zone: "B", lat: 40.656739, lng: -7.913574 },
  { id: "b13", name: "Ecoponto Praça Tenente Miguel Ponces", zone: "B", lat: 40.656339, lng: -7.917747 },
  { id: "b14", name: "Ecoponto Travessa dos Olivais", zone: "B", lat: 40.65616, lng: -7.910708 },
  { id: "b15", name: "Ecoponto Avenida Calouste Gulbenkian", zone: "B", lat: 40.654988, lng: -7.913789 },
  { id: "b16", name: "Ecoponto Rua Dom António Monteiro", zone: "B", lat: 40.654749, lng: -7.909093 },
];

const SEED_STREETLIGHTS: Array<Pick<Streetlight, "id" | "name" | "zone" | "lat" | "lng">> = [
  { id: "l01", name: "Poste 12 — Rua do Arco", zone: "A", lat: 40.66166, lng: -7.90866 },
  { id: "l02", name: "Poste 3 — Rua Bombeiros Voluntários", zone: "A", lat: 40.661352, lng: -7.916304 },
  { id: "l03", name: "Poste 27 — Rua Serpa Pinto", zone: "A", lat: 40.660733, lng: -7.913651 },
  { id: "l04", name: "Poste 8 — Travessa de Santa Teresinha", zone: "A", lat: 40.66052, lng: -7.914566 },
  { id: "l05", name: "Poste 41 — Adro da Sé", zone: "A", lat: 40.66011, lng: -7.9117 },
  { id: "l06", name: "Poste 5 — Rua Soar de Cima", zone: "B", lat: 40.658134, lng: -7.913451 },
  { id: "l07", name: "Poste 19 — Praça da República", zone: "B", lat: 40.657823, lng: -7.914399 },
  { id: "l08", name: "Poste 33 — Praça da República", zone: "B", lat: 40.657768, lng: -7.913751 },
  { id: "l09", name: "Poste 2 — Rua Direita", zone: "B", lat: 40.65745, lng: -7.91186 },
  { id: "l10", name: "Poste 14 — Rua Formosa", zone: "B", lat: 40.65728, lng: -7.91209 },
];

const SEED_AIR_STATIONS: Array<Pick<AirStation, "id" | "name" | "zone" | "lat" | "lng">> = [
  { id: "ar01", name: "Estação Adro da Sé (Zona A)", zone: "A", lat: 40.65995, lng: -7.91185 },
  { id: "ar02", name: "Estação Rossio (Zona B)", zone: "B", lat: 40.65689, lng: -7.91396 },
];

const SEED_TRAFFIC_ROUTES: Array<Pick<TrafficRoute, "id" | "name" | "zone">> = [
  { id: "tr01", name: "Avenida Emídio Navarro", zone: "A" },
  { id: "tr02", name: "Rua Serpa Pinto", zone: "A" },
  { id: "tr03", name: "Av. Dr. António José de Almeida", zone: "A" },
  { id: "tr04", name: "Avenida 25 de Abril", zone: "B" },
  { id: "tr05", name: "Avenida Alberto Sampaio", zone: "B" },
  { id: "tr06", name: "Rua 5 de Outubro", zone: "B" },
];

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

const SEED_NEWS: Array<Omit<NewsItem, "id" | "createdAt">> = [
  {
    title: "Rua Serpa Pinto cortada ao trânsito",
    category: "obra",
    description: "Obras de repavimentação. Trânsito condicionado entre a Sé e a Avenida Emídio Navarro.",
    zone: "A",
    startDate: daysFromNow(-2),
    endDate: daysFromNow(2),
  },
  {
    title: "Manutenção de iluminação pública — Centro Histórico",
    category: "obra",
    description: "Equipas municipais a substituir luminárias antigas por LED na zona da Sé e Rua Direita.",
    zone: "A",
    startDate: daysFromNow(0),
    endDate: daysFromNow(1),
  },
  {
    title: "Feira de S. Mateus",
    category: "evento",
    description: "Feira anual com artesanato, gastronomia e musica ao vivo, no recinto da Feira de São Mateus.",
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
    title: "Recolha extraordinária de monos — Rossio",
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
