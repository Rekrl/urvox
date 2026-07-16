"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badges";
import { STATUS_COLORS } from "@/lib/palette";
import type { NewsCategory, NewsItem } from "@/lib/types";

const CATEGORY_CONFIG: Record<NewsCategory, { label: string; icon: string; color: string }> = {
  obra: { label: "Obra / corte de via", icon: "▲", color: STATUS_COLORS.warning },
  evento: { label: "Evento", icon: "●", color: "#7c63e0" },
  aviso: { label: "Aviso", icon: "■", color: "#3d82c9" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (start.toDateString() === end.toDateString()) return formatDate(startIso);

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    const day = start.toLocaleDateString("pt-PT", { day: "numeric" });
    return `${day} a ${formatDate(endIso)}`;
  }
  return `${formatDate(startIso)} a ${formatDate(endIso)}`;
}

function newsState(item: NewsItem): { label: string; color: string; live: boolean } {
  const now = Date.now();
  const start = new Date(item.startDate).getTime();
  const end = new Date(item.endDate).getTime() + 86_400_000; // inclusive of end day
  if (now < start) return { label: "Agendado", color: "#3d82c9", live: false };
  if (now >= end) return { label: "Terminado", color: "#75847b", live: false };
  return { label: "A decorrer", color: STATUS_COLORS.ok, live: true };
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<NewsCategory | "all">("all");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/news")
      .then((r) => r.json())
      .then((res) => {
        if (!cancelled) setItems(res.items);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (categoryFilter === "all" ? items : items.filter((i) => i.category === categoryFilter)),
    [items, categoryFilter]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-text-on-ink sm:text-3xl">
        Notícias e alertas municipais
      </h1>
      <p className="mt-1 text-sm text-text-on-ink-secondary">
        Obras, eventos e avisos da câmara — o mesmo espaço para toda a cidade acompanhar.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", "obra", "evento", "aviso"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              categoryFilter === c
                ? "border-accent/60 bg-accent/10 text-text-on-ink"
                : "border-ink-3 text-text-on-ink-secondary"
            }`}
          >
            {c === "all" ? "Tudo" : CATEGORY_CONFIG[c].label}
          </button>
        ))}
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {filtered.map((item) => {
          const cat = CATEGORY_CONFIG[item.category];
          const state = newsState(item);
          return (
            <li key={item.id} className="rounded-2xl border border-ink-3 bg-ink-2/50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge label={cat.label} icon={cat.icon} color={cat.color} />
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium`}
                  style={{ color: state.color }}
                >
                  {state.live && <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-status-good" />}
                  {state.label}
                </span>
              </div>
              <h2 className="mt-3 font-display text-lg text-text-on-ink">{item.title}</h2>
              <p className="mt-1 text-sm text-text-on-ink-secondary">{item.description}</p>
              <p className="mt-3 font-mono text-xs text-text-on-ink-muted">
                {formatRange(item.startDate, item.endDate)} ·{" "}
                {item.zone === "todas" ? "Toda a cidade" : `Zona ${item.zone}`}
              </p>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-text-on-ink-secondary">Sem notícias nesta categoria.</p>
        )}
      </ul>
    </div>
  );
}
