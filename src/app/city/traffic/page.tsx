"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/Badges";
import { StatusLegend } from "@/components/StatusLegend";
import { Sparkline } from "@/components/Sparkline";
import { STATUS_COLORS } from "@/lib/palette";
import type { TrafficRoute } from "@/lib/types";

export default function TrafficTabPage() {
  const [routes, setRoutes] = useState<TrafficRoute[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/traffic").then((r) => r.json());
      if (!cancelled) setRoutes(res.routes);
    }
    load();
    const interval = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-text-on-ink-secondary">
          Congestionamento simulado por via principal — hoje baseado em câmaras de
          tráfego, no roadmap.
        </p>
        <StatusLegend labels={["Fluido", "Moderado", "Congestionado"]} />
      </div>

      <ul className="mt-6 flex flex-col gap-2">
        {routes.map((route) => (
          <li
            key={route.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-ink-3 bg-ink-2/40 p-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-on-ink">{route.name}</p>
              <p className="mt-0.5 text-xs text-text-on-ink-muted">
                Zona {route.zone} ·{" "}
                {route.etaDeltaMin > 0
                  ? `+${route.etaDeltaMin} min face ao normal`
                  : "sem atraso"}
              </p>
            </div>
            <Sparkline data={route.history} color={STATUS_COLORS[route.status]} width={80} height={24} />
            <StatusBadge status={route.status} labels={["Fluido", "Moderado", "Congestionado"]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
