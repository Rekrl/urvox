"use client";

import { useEffect, useState } from "react";

type PrivacyLevel = "basico" | "elevado" | "personalizado";
type LocationSharing = "nunca" | "ao_usar" | "sempre";

type PrivacyPrefs = {
  level: PrivacyLevel;
  location: LocationSharing;
  removeMetadata: boolean;
  blurFaces: boolean;
  blurPlates: boolean;
};

const DEFAULT_PREFS: PrivacyPrefs = {
  level: "basico",
  location: "ao_usar",
  removeMetadata: true,
  blurFaces: true,
  blurPlates: false,
};

const STORAGE_KEY = "urvox.privacy";

export default function PrivacyPage() {
  const [prefs, setPrefs] = useState<PrivacyPrefs>(DEFAULT_PREFS);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // localStorage is unavailable during SSR, so prefs must start as
      // defaults and sync after mount — reading it during render would
      // cause a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // ignore malformed local state
    }
  }, []);

  function update(next: Partial<PrivacyPrefs>) {
    const merged = { ...prefs, ...next };
    setPrefs(merged);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  function showNotice(text: string) {
    setNotice(text);
    setTimeout(() => setNotice(null), 4000);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-text-on-ink sm:text-3xl">
        Privacidade e dados
      </h1>
      <p className="mt-1 text-sm text-text-on-ink-secondary">
        O seu controlo sobre o que é partilhado — as preferências ficam guardadas
        apenas neste dispositivo.
      </p>

      <section className="mt-6 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
        <h2 className="text-sm font-medium text-text-on-ink">O seu controlo</h2>
        <div className="mt-3 flex flex-col gap-2">
          {(
            [
              { value: "basico", label: "Básico (recomendado)", desc: "Proteção standard" },
              { value: "elevado", label: "Elevado", desc: "Mais privado, menos funcionalidades" },
              { value: "personalizado", label: "Personalizado", desc: "Controlo total" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 ${
                prefs.level === opt.value
                  ? "border-accent/60 bg-accent/10"
                  : "border-ink-3"
              }`}
            >
              <span>
                <span className="block text-sm text-text-on-ink">{opt.label}</span>
                <span className="block text-xs text-text-on-ink-muted">{opt.desc}</span>
              </span>
              <input
                type="radio"
                name="level"
                checked={prefs.level === opt.value}
                onChange={() => update({ level: opt.value })}
                className="h-4 w-4 accent-[color:var(--accent)]"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
        <h2 className="text-sm font-medium text-text-on-ink">Localização</h2>
        <p className="mt-1 text-xs text-text-on-ink-muted">
          Usada para: reportar problemas locais, qualidade do ar na zona, alertas
          de tráfego.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {(
            [
              { value: "nunca", label: "Nunca" },
              { value: "ao_usar", label: "Apenas quando usar a app" },
              { value: "sempre", label: "Sempre (melhor serviço)" },
            ] as const
          ).map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-text-on-ink-secondary">
              <input
                type="radio"
                name="location"
                checked={prefs.location === opt.value}
                onChange={() => update({ location: opt.value })}
                className="h-4 w-4 accent-[color:var(--accent)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
        <h2 className="text-sm font-medium text-text-on-ink">Fotos em reportes</h2>
        <div className="mt-3 flex flex-col gap-2 text-sm text-text-on-ink-secondary">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={prefs.removeMetadata}
              onChange={(e) => update({ removeMetadata: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--accent)]"
            />
            Remover metadados
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={prefs.blurFaces}
              onChange={(e) => update({ blurFaces: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--accent)]"
            />
            Desfocar rostos
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={prefs.blurPlates}
              onChange={(e) => update({ blurPlates: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--accent)]"
            />
            Desfocar matrículas
          </label>
        </div>
        <p className="mt-3 text-xs text-text-on-ink-muted">
          As suas fotos são armazenadas encriptadas, nunca partilhadas
          publicamente e apagadas após a resolução do reporte.
        </p>
      </section>

      <section className="mt-5 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
        <h2 className="text-sm font-medium text-text-on-ink">O que guardamos</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-on-ink-muted">Na blockchain</p>
            <ul className="mt-1 flex flex-col gap-1 text-sm text-text-on-ink-secondary">
              <li>· Hashes de eventos</li>
              <li>· Timestamps</li>
              <li>· Categoria e zona (anónimos)</li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-on-ink-muted">Nunca na blockchain</p>
            <ul className="mt-1 flex flex-col gap-1 text-sm text-text-on-ink-secondary">
              <li>· Nome, morada, contactos</li>
              <li>· Fotos ou documentos</li>
              <li>· Histórico de navegação</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => showNotice("Demonstração: em produção, isto geraria uma exportação GDPR dos seus dados.")}
          className="rounded-full border border-ink-3 px-4 py-2 text-sm text-text-on-ink-secondary transition-colors hover:border-accent/50 hover:text-text-on-ink"
        >
          Exportar os meus dados
        </button>
        <button
          onClick={() => showNotice("Demonstração: em produção, isto acionaria o fluxo de eliminação de conta (GDPR).")}
          className="rounded-full border border-ink-3 px-4 py-2 text-sm text-text-on-ink-secondary transition-colors hover:border-status-critical/60 hover:text-status-critical"
        >
          Apagar a minha conta
        </button>
      </div>
      {notice && <p className="rise-in mt-3 text-sm text-text-on-ink-secondary">{notice}</p>}
    </div>
  );
}
