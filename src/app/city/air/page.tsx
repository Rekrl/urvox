"use client";

import { useEffect, useState } from "react";
import { CityMap } from "@/components/CityMap";
import { StatusBadge } from "@/components/Badges";
import { StatusLegend } from "@/components/StatusLegend";
import { Sparkline } from "@/components/Sparkline";
import { STATUS_COLORS } from "@/lib/palette";
import type { AirStation } from "@/lib/types";

export default function AirTabPage() {
  const [stations, setStations] = useState<AirStation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/air").then((r) => r.json());
      if (!cancelled) setStations(res.stations);
    }
    load();
    const interval = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const selected = stations.find((s) => s.id === selectedId) ?? stations[0] ?? null;

  return (
    <div>
      <p className="text-sm text-text-on-ink-secondary">
        PM2.5 simulado por estação. Limiares: boa &lt;20 · moderada 20–40 · má &gt;40 µg/m³.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="aspect-square">
            <CityMap
              points={stations}
              selectedId={selected?.id ?? null}
              onSelect={setSelectedId}
              ariaLabel="Mapa ilustrativo das estações de qualidade do ar"
            />
          </div>
          <div className="mt-3">
            <StatusLegend labels={["Boa", "Moderada", "Má"]} />
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-3">
          {stations.map((station) => (
            <button
              key={station.id}
              onClick={() => setSelectedId(station.id)}
              className={`flex items-center justify-between gap-4 rounded-xl border p-5 text-left transition-colors ${
                station.id === selected?.id
                  ? "border-accent/60 bg-accent/5"
                  : "border-ink-3 bg-ink-2/40"
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-on-ink">{station.name}</p>
                <p className="mt-0.5 text-xs text-text-on-ink-muted">Zona {station.zone}</p>
                <div className="mt-3 flex items-center gap-3">
                  <Sparkline
                    data={station.history}
                    color={STATUS_COLORS[station.status]}
                    width={120}
                    height={32}
                  />
                  <span className="font-display text-2xl text-text-on-ink">
                    {station.pm25}
                    <span className="ml-1 text-sm text-text-on-ink-muted">µg/m³</span>
                  </span>
                </div>
              </div>
              <StatusBadge status={station.status} labels={["Boa", "Moderada", "Má"]} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
