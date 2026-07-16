"use client";

import { useEffect, useState } from "react";
import type { LedgerBlock, LedgerEventType } from "@/lib/types";

const EVENT_CONFIG: Record<LedgerEventType, { label: string; icon: string; color: string }> = {
  contentor_critico: { label: "Contentor crítico", icon: "▲", color: "#e3a83d" },
  recolha: { label: "Recolha efetuada", icon: "✓", color: "#2fae72" },
  reporte_criado: { label: "Reporte criado", icon: "○", color: "#3d82c9" },
  reporte_em_curso: { label: "Reporte em curso", icon: "◐", color: "#e3a83d" },
  reporte_resolvido: { label: "Reporte resolvido", icon: "✓", color: "#2fae72" },
  poste_reportado: { label: "Poste reportado", icon: "○", color: "#3d82c9" },
  poste_reparado: { label: "Poste reparado", icon: "✓", color: "#2fae72" },
  ar_critico: { label: "Ar crítico", icon: "▲", color: "#e3a83d" },
};

function truncateHash(hash: string) {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

export default function TransparencyPage() {
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [valid, setValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/ledger").then((r) => r.json());
      if (cancelled) return;
      setBlocks(res.blocks);
      setValid(res.verification.valid);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-text-on-ink sm:text-3xl">
        Explorador do registo público
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-text-on-ink-secondary">
        Cada evento relevante — contentores críticos, recolhas, reportes — entra
        num livro-razão encadeado por hash. Qualquer pessoa pode verificar que a
        cadeia nunca foi alterada.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-ink-3 bg-ink-2/50 p-5">
        {loading ? (
          <span className="text-sm text-text-on-ink-secondary">A verificar cadeia…</span>
        ) : (
          <span
            className={`inline-flex items-center gap-2 text-sm font-medium ${
              valid ? "text-status-good" : "text-status-critical"
            }`}
          >
            {valid ? "✓ Cadeia íntegra — nenhum bloco foi alterado" : "✕ Cadeia comprometida"}
          </span>
        )}
        <span className="font-mono text-xs text-text-on-ink-muted">
          {blocks.length} blocos · SHA-256 · verificação recomputada a cada carregamento
        </span>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_260px]">
        <ol className="relative flex flex-col gap-3 border-l border-ink-3/70 pl-6">
          {blocks.map((block) => {
            const cfg = EVENT_CONFIG[block.type];
            return (
              <li key={block.hash} className="relative">
                <span
                  className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-ink-0"
                  style={{ background: cfg.color }}
                />
                <div className="rounded-xl border border-ink-3 bg-ink-2/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-text-on-ink">
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      {cfg.label}
                    </span>
                    <span className="font-mono text-xs text-text-on-ink-muted">
                      #{block.index} · {new Date(block.timestamp).toLocaleString("pt-PT")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-text-on-ink-secondary">{block.summary}</p>
                  <p className="hash-texture mt-2 text-xs">hash {truncateHash(block.hash)}</p>
                  <p className="hash-texture text-xs">prev {truncateHash(block.prevHash)}</p>
                </div>
              </li>
            );
          })}
          {blocks.length === 0 && !loading && (
            <p className="text-sm text-text-on-ink-secondary">
              Ainda não há eventos registados — volte daqui a instantes.
            </p>
          )}
        </ol>

        <aside className="h-fit rounded-2xl border border-ink-3 bg-ink-2/50 p-5">
          <h2 className="text-sm font-medium text-text-on-ink">O que fica registado</h2>
          <p className="mt-3 text-xs uppercase tracking-wide text-text-on-ink-muted">
            Na cadeia
          </p>
          <ul className="mt-1 flex flex-col gap-1 text-sm text-text-on-ink-secondary">
            <li>· Tipo de evento e zona</li>
            <li>· Categoria do reporte</li>
            <li>· Timestamps e hashes</li>
          </ul>
          <p className="mt-4 text-xs uppercase tracking-wide text-text-on-ink-muted">
            Nunca na cadeia
          </p>
          <ul className="mt-1 flex flex-col gap-1 text-sm text-text-on-ink-secondary">
            <li>· Nome do cidadão</li>
            <li>· Descrição do reporte</li>
            <li>· Localização exata</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
