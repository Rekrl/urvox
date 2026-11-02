"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReportStatusBadge } from "@/components/Badges";
import { getSession, type CitizenSession } from "@/lib/auth";
import type { AirStation, Bin, LedgerBlock, NewsItem, Report, TrafficRoute } from "@/lib/types";

function isNewsStillActive(item: NewsItem): boolean {
  return new Date(item.endDate).getTime() + 86_400_000 >= Date.now();
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<CitizenSession | null>(null);
  const [bins, setBins] = useState<Bin[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [ledger, setLedger] = useState<{ blocks: LedgerBlock[]; valid: boolean } | null>(null);
  const [airStations, setAirStations] = useState<AirStation[]>([]);
  const [trafficRoutes, setTrafficRoutes] = useState<TrafficRoute[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    // localStorage is unavailable during SSR, so session must start null and
    // sync after mount — reading it during render would cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(s);
  }, [router]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function load() {
      const [binsRes, reportsRes, ledgerRes, airRes, trafficRes, newsRes] = await Promise.all([
        fetch("/api/bins").then((r) => r.json()),
        fetch(`/api/reports?citizen=${encodeURIComponent(session!.name)}`).then((r) => r.json()),
        fetch("/api/ledger").then((r) => r.json()),
        fetch("/api/air").then((r) => r.json()),
        fetch("/api/traffic").then((r) => r.json()),
        fetch("/api/news").then((r) => r.json()),
      ]);
      if (cancelled) return;
      setBins(binsRes.bins);
      setReports(reportsRes.reports);
      setLedger({ blocks: ledgerRes.blocks, valid: ledgerRes.verification.valid });
      setAirStations(airRes.stations);
      setTrafficRoutes(trafficRes.routes);
      setNews(newsRes.items);
    }

    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session]);

  if (!session) return null;

  const zoneBins = bins.filter((b) => b.zone === session.zone);
  const criticalCount = zoneBins.filter((b) => b.status === "critical").length;
  const warningCount = zoneBins.filter((b) => b.status === "warning").length;
  const okCount = zoneBins.filter((b) => b.status === "ok").length;

  const zoneAirStation = airStations.find((s) => s.zone === session.zone) ?? null;
  const zoneRoutes = trafficRoutes.filter((r) => r.zone === session.zone);
  const worstRoute = [...zoneRoutes].sort((a, b) => b.etaDeltaMin - a.etaDeltaMin)[0] ?? null;
  const activeNews = news
    .filter((n) => (n.zone === "todas" || n.zone === session.zone) && isNewsStillActive(n))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-text-on-ink sm:text-3xl">
        Olá, {session.name.split(" ")[0]}!
      </h1>
      <p className="mt-1 text-sm text-text-on-ink-secondary">
        Zona {session.zone} · {session.zone === "A" ? "Centro Histórico" : "Rossio / Baixa"}
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-3 bg-ink-2/50 p-6 lg:col-span-1">
          <h2 className="text-sm font-medium text-text-on-ink">
            Contentores da sua zona
          </h2>
          <div className="mt-4 flex items-end gap-6">
            <div>
              <p className="font-display text-3xl text-status-good">{okCount}</p>
              <p className="text-xs text-text-on-ink-muted">normal</p>
            </div>
            <div>
              <p className="font-display text-3xl text-status-warning">{warningCount}</p>
              <p className="text-xs text-text-on-ink-muted">atenção</p>
            </div>
            <div>
              <p className="font-display text-3xl text-status-critical">{criticalCount}</p>
              <p className="text-xs text-text-on-ink-muted">crítico</p>
            </div>
          </div>
          <Link
            href="/city"
            className="mt-5 inline-block text-sm text-accent hover:underline"
          >
            Ver mapa de contentores →
          </Link>
        </div>

        <div className="rounded-2xl border border-ink-3 bg-ink-2/50 p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-text-on-ink">Os seus pedidos</h2>
            <Link href="/report" className="text-xs text-accent hover:underline">
              + Novo
            </Link>
          </div>
          {reports.length === 0 ? (
            <p className="mt-4 text-sm text-text-on-ink-secondary">
              Ainda não tem pedidos. Viu algum problema na sua rua?
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {reports.slice(0, 3).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-text-on-ink-secondary">
                    {r.description || r.category}
                  </span>
                  <ReportStatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/report"
            className="mt-5 inline-block text-sm text-accent hover:underline"
          >
            Reportar um problema →
          </Link>
        </div>

        <div className="rounded-2xl border border-ink-3 bg-ink-2/50 p-6 lg:col-span-1">
          <h2 className="text-sm font-medium text-text-on-ink">Transparência pública</h2>
          {ledger ? (
            <>
              <p className="mt-4 font-display text-3xl text-text-on-ink">
                {ledger.blocks.length}
              </p>
              <p className="text-xs text-text-on-ink-muted">eventos no registo</p>
              <p
                className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${
                  ledger.valid ? "text-status-good" : "text-status-critical"
                }`}
              >
                {ledger.valid ? "✓ Cadeia íntegra" : "✕ Cadeia comprometida"}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-text-on-ink-secondary">A carregar…</p>
          )}
          <Link
            href="/transparency"
            className="mt-5 inline-block text-sm text-accent hover:underline"
          >
            Explorar o registo →
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-3 bg-ink-2/50 p-6 lg:col-span-1">
          <h2 className="text-sm font-medium text-text-on-ink">Qualidade do ar</h2>
          {zoneAirStation ? (
            <>
              <p className="mt-4 font-display text-3xl text-text-on-ink">
                {zoneAirStation.pm25}
                <span className="ml-1 text-sm text-text-on-ink-muted">µg/m³</span>
              </p>
              <p className="text-xs text-text-on-ink-muted">{zoneAirStation.name}</p>
            </>
          ) : (
            <p className="mt-4 text-sm text-text-on-ink-secondary">A carregar…</p>
          )}
          <Link href="/city/air" className="mt-5 inline-block text-sm text-accent hover:underline">
            Ver estações de ar →
          </Link>
        </div>

        <div className="rounded-2xl border border-ink-3 bg-ink-2/50 p-6 lg:col-span-1">
          <h2 className="text-sm font-medium text-text-on-ink">Trânsito</h2>
          {worstRoute ? (
            <>
              <p className="mt-4 truncate text-sm font-medium text-text-on-ink">{worstRoute.name}</p>
              <p className="text-xs text-text-on-ink-muted">
                {worstRoute.etaDeltaMin > 0 ? `+${worstRoute.etaDeltaMin} min de atraso` : "sem atraso"}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-text-on-ink-secondary">A carregar…</p>
          )}
          <Link href="/city/traffic" className="mt-5 inline-block text-sm text-accent hover:underline">
            Ver todas as vias →
          </Link>
        </div>

        <div className="rounded-2xl border border-ink-3 bg-ink-2/50 p-6 lg:col-span-1">
          <h2 className="text-sm font-medium text-text-on-ink">Notícias da sua zona</h2>
          {activeNews.length === 0 ? (
            <p className="mt-4 text-sm text-text-on-ink-secondary">Sem avisos ativos.</p>
          ) : (
            <p className="mt-4 truncate text-sm text-text-on-ink">{activeNews[0].title}</p>
          )}
          <Link href="/news" className="mt-5 inline-block text-sm text-accent hover:underline">
            Ver todas as notícias →
          </Link>
        </div>
      </div>
    </div>
  );
}
