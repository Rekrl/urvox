import type {
  AirStation,
  Bin,
  LedgerBlock,
  NewsItem,
  Report,
  Streetlight,
  TrafficRoute,
  WorkOrder,
} from "./types";

type Store = {
  bins: Bin[];
  streetlights: Streetlight[];
  airStations: AirStation[];
  trafficRoutes: TrafficRoute[];
  newsItems: NewsItem[];
  workOrders: WorkOrder[];
  reports: Report[];
  ledger: LedgerBlock[];
  simulatorStarted: boolean;
};

const globalForStore = globalThis as unknown as { __citypulseStore?: Store };

export function getStore(): Store {
  if (!globalForStore.__citypulseStore) {
    globalForStore.__citypulseStore = {
      bins: [],
      streetlights: [],
      airStations: [],
      trafficRoutes: [],
      newsItems: [],
      workOrders: [],
      reports: [],
      ledger: [],
      simulatorStarted: false,
    };
  }
  return globalForStore.__citypulseStore;
}
