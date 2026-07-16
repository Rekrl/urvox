"use client";

import { useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/StatCard";
import type { Bin, LedgerBlock, Report } from "@/lib/types";

const BUCKET_COUNT = 10;
const BUCKET_MS = 60_000;

export default function StatsPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [ledger, setLedger] = useState<LedgerBlock[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [binsRes, reportsRes, ledgerRes] = await Promise.all([
        fetch("/api/bins").then((r) => r.json()),
        fetch("/api/reports").then((r) => r.json()),
        fetch("/api/ledger").then((r) => r.json()),
      ]);
      if (cancelled) return;
      setBins(binsRes.bins);
      setReports(reportsRes.reports);
      setLedger(ledgerRes.blocks);
      setNow(Date.now());
    }
    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const collections = ledger.filter((b) => b.type === "recolha");
  const resolvedReports = reports.filter((r) => r.status === "resolvido");
  const resolutionRate = reports.length
    ? Math.round((resolvedReports.length / reports.length) * 100)
    : 0;
  const okBins = bins.filter((b) => b.status === "ok").length;

  const buckets = useMemo(() => {
    const arr = Array.from({ length: BUCKET_COUNT }, (_, i) => ({
      label: `${BUCKET_COUNT - i}m`,
      count: 0,
    }));
    for (const c of collections) {
      const age = now - new Date(c.timestamp).getTime();
      const idx = BUCKET_COUNT - 1 - Math.floor(age / BUCKET_MS);
      if (idx >= 0 && idx < BUCKET_COUNT) arr[idx].count += 1;
    }
    return arr;
  }, [collections, now]);

  const maxCount = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-text-on-ink sm:text-3xl">
        Estatísticas de sustentabilidade
      </h1>
      <p className="mt-1 text-sm text-text-on-ink-secondary">
        Métricas calculadas a partir da atividade real desta sessão de
        demonstração.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Recolhas efetuadas" value={String(collections.length)} tone="good" />
        <StatCard
          label="Reportes resolvidos"
          value={`${resolutionRate}%`}
          delta={`${resolvedReports.length} de ${reports.length}`}
          tone="good"
        />
        <StatCard label="Contentores normais" value={`${okBins} / ${bins.length || 0}`} />
        <StatCard label="Eventos no registo" value={String(ledger.length)} />
      </div>

      <div className="mt-8 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-text-on-ink">
            Recolhas por minuto
          </h2>
          <span className="text-xs text-text-on-ink-muted">sessão atual</span>
        </div>
        <div className="mt-6 flex h-32 items-end gap-2">
          {buckets.map((b) => (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-accent transition-all"
                style={{ height: `${(b.count / maxCount) * 100}%`, minHeight: b.count > 0 ? 4 : 0 }}
                title={`${b.count} recolhas há ${b.label}`}
              />
              <span className="font-mono text-[10px] text-text-on-ink-muted">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="hash-texture mt-6 text-xs">
        urvox · dados gerados pela simulação local desta demonstração, não
        refletem uma cidade real
      </p>
    </div>
  );
}
