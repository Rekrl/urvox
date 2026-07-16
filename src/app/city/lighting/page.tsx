"use client";

import { useEffect, useMemo, useState } from "react";
import { CityMap } from "@/components/CityMap";
import { StatusBadge, WorkOrderStatusBadge } from "@/components/Badges";
import { StatusLegend } from "@/components/StatusLegend";
import { relativeTime } from "@/lib/format";
import type { Report, ReportStatus, Streetlight, WorkOrder, Zone } from "@/lib/types";

function workOrderStatusFromReport(status: ReportStatus): "aberta" | "em_execucao" | "concluida" {
  if (status === "submetido") return "aberta";
  if (status === "em_curso") return "em_execucao";
  return "concluida";
}

export default function LightingTabPage() {
  const [streetlights, setStreetlights] = useState<Streetlight[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [zoneFilter, setZoneFilter] = useState<Zone | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [lightingRes, reportsRes] = await Promise.all([
        fetch("/api/lighting").then((r) => r.json()),
        fetch("/api/reports").then((r) => r.json()),
      ]);
      if (cancelled) return;
      setStreetlights(lightingRes.streetlights);
      setWorkOrders(lightingRes.workOrders);
      setReports(reportsRes.reports);
    }
    load();
    const interval = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    const list =
      zoneFilter === "all" ? streetlights : streetlights.filter((l) => l.zone === zoneFilter);
    return [...list].sort((a, b) => (a.status === b.status ? 0 : a.status === "critical" ? -1 : 1));
  }, [streetlights, zoneFilter]);

  const selected = filtered.find((l) => l.id === selectedId) ?? null;

  const activeOrders = workOrders
    .map((wo) => ({ wo, report: reports.find((r) => r.id === wo.reportId) }))
    .filter((entry): entry is { wo: WorkOrder; report: Report } => Boolean(entry.report))
    .sort((a, b) => new Date(b.wo.createdAt).getTime() - new Date(a.wo.createdAt).getTime());

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm text-text-on-ink-secondary">
          Estado dos postes reportado pelos cidadãos — sem sensores, tal como acontece
          hoje na maioria dos municípios.
        </p>
        <div className="flex gap-2">
          {(["all", "A", "B"] as const).map((z) => (
            <button
              key={z}
              onClick={() => setZoneFilter(z)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                zoneFilter === z
                  ? "border-accent/60 bg-accent/10 text-text-on-ink"
                  : "border-ink-3 text-text-on-ink-secondary"
              }`}
            >
              {z === "all" ? "Todas as zonas" : `Zona ${z}`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="aspect-square">
            <CityMap
              points={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              ariaLabel="Mapa ilustrativo dos postes de iluminação"
            />
          </div>
          <div className="mt-3">
            <StatusLegend labels={["Funcional", "A piscar", "Avariado"]} />
          </div>

          {selected && (
            <div className="mt-4 rounded-2xl border border-ink-3 bg-ink-2/50 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-text-on-ink">{selected.name}</h3>
                <StatusBadge status={selected.status} labels={["Funcional", "A piscar", "Avariado"]} />
              </div>
              <p className="mt-1 text-xs text-text-on-ink-muted">
                Zona {selected.zone} · última verificação {relativeTime(selected.lastChecked)}
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <ul className="flex flex-col gap-2">
            {filtered.map((light) => (
              <li key={light.id}>
                <button
                  onClick={() => setSelectedId(light.id)}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${
                    light.id === selectedId
                      ? "border-accent/60 bg-accent/5"
                      : "border-ink-3 bg-ink-2/40 hover:border-ink-3"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-on-ink">{light.name}</p>
                    <p className="mt-0.5 text-xs text-text-on-ink-muted">
                      Zona {light.zone} · verificado {relativeTime(light.lastChecked)}
                    </p>
                  </div>
                  <StatusBadge status={light.status} labels={["Funcional", "A piscar", "Avariado"]} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-medium text-text-on-ink">Ordens de serviço</h2>
        {activeOrders.length === 0 ? (
          <p className="mt-3 text-sm text-text-on-ink-secondary">
            Sem ordens de serviço geradas nesta sessão.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {activeOrders.map(({ wo, report }) => (
              <li
                key={wo.id}
                className="flex flex-col gap-2 rounded-xl border border-ink-3 bg-ink-2/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-text-on-ink">{wo.reference}</p>
                  <p className="mt-0.5 text-xs text-text-on-ink-muted">
                    Zona {report.zone} · aberta {relativeTime(wo.createdAt)}
                  </p>
                </div>
                <WorkOrderStatusBadge status={workOrderStatusFromReport(report.status)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
