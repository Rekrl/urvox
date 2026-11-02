"use client";

import { useEffect, useMemo, useState } from "react";
import { CityMap } from "@/components/CityMap";
import { StatusBadge } from "@/components/Badges";
import { StatusLegend } from "@/components/StatusLegend";
import { Sparkline } from "@/components/Sparkline";
import { STATUS_COLORS } from "@/lib/palette";
import { relativeTime } from "@/lib/format";
import type { Bin, Zone } from "@/lib/types";

export default function BinsTabPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [zoneFilter, setZoneFilter] = useState<Zone | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/bins").then((r) => r.json());
      if (!cancelled) setBins(res.bins);
    }
    load();
    const interval = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    const list = zoneFilter === "all" ? bins : bins.filter((b) => b.zone === zoneFilter);
    return [...list].sort((a, b) => b.level - a.level);
  }, [bins, zoneFilter]);

  const selected = filtered.find((b) => b.id === selectedId) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm text-text-on-ink-secondary">
          Nível de enchimento simulado, atualizado a cada poucos segundos.
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
              ariaLabel="Mapa dos contentores — Viseu"
            />
          </div>
          <div className="mt-3">
            <StatusLegend />
          </div>

          {selected && (
            <div className="mt-4 rounded-2xl border border-ink-3 bg-ink-2/50 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-text-on-ink">{selected.name}</h3>
                <StatusBadge status={selected.status} />
              </div>
              <p className="mt-1 text-xs text-text-on-ink-muted">
                Zona {selected.zone} · {selected.capacityL} L · última recolha {relativeTime(selected.lastCollection)}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Sparkline data={selected.history} color={STATUS_COLORS[selected.status]} width={140} height={36} />
                <span className="font-display text-2xl text-text-on-ink">{selected.level}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <ul className="flex flex-col gap-2">
            {filtered.map((bin) => (
              <li key={bin.id}>
                <button
                  onClick={() => setSelectedId(bin.id)}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${
                    bin.id === selectedId
                      ? "border-accent/60 bg-accent/5"
                      : "border-ink-3 bg-ink-2/40 hover:border-ink-3"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-on-ink">{bin.name}</p>
                    <p className="mt-0.5 text-xs text-text-on-ink-muted">
                      Zona {bin.zone} · última recolha {relativeTime(bin.lastCollection)}
                    </p>
                  </div>
                  <Sparkline
                    data={bin.history}
                    color={STATUS_COLORS[bin.status]}
                    width={64}
                    height={22}
                  />
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-text-on-ink-secondary">
                      {bin.level}%
                    </span>
                    <StatusBadge status={bin.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
