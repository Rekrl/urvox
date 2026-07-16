"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReportStatusBadge } from "@/components/Badges";
import { getSession, type CitizenSession } from "@/lib/auth";
import type { Bin, Report, ReportCategory, Streetlight, WorkOrder } from "@/lib/types";

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "contentor_cheio", label: "Contentor cheio" },
  { value: "contentor_danificado", label: "Contentor danificado" },
  { value: "falta_recolha", label: "Falta de recolha" },
  { value: "poste_avariado", label: "Poste de iluminação avariado" },
  { value: "outro", label: "Outro" },
];

const BIN_CATEGORIES: ReportCategory[] = ["contentor_cheio", "contentor_danificado", "falta_recolha"];
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

export default function ReportPage() {
  const router = useRouter();
  const [session, setSessionState] = useState<CitizenSession | null>(null);
  const [bins, setBins] = useState<Bin[]>([]);
  const [streetlights, setStreetlights] = useState<Streetlight[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [category, setCategory] = useState<ReportCategory>("contentor_cheio");
  const [binId, setBinId] = useState<string>("");
  const [streetlightId, setStreetlightId] = useState<string>("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    // localStorage is unavailable during SSR, so session must start null and
    // sync after mount — reading it during render would cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionState(s);
  }, [router]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    async function load() {
      const [binsRes, lightingRes, reportsRes] = await Promise.all([
        fetch("/api/bins").then((r) => r.json()),
        fetch("/api/lighting").then((r) => r.json()),
        fetch(`/api/reports?citizen=${encodeURIComponent(session!.name)}`).then((r) => r.json()),
      ]);
      if (cancelled) return;
      setBins(binsRes.bins.filter((b: Bin) => b.zone === session!.zone));
      setStreetlights(
        lightingRes.streetlights.filter((l: Streetlight) => l.zone === session!.zone)
      );
      setWorkOrders(lightingRes.workOrders);
      setReports(reportsRes.reports);
    }

    load();
    const interval = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoError(null);
    if (!file) {
      setPhotoDataUrl(null);
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Imagem demasiado grande (máx. 3MB).");
      setPhotoDataUrl(null);
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.onerror = () => setPhotoError("Não foi possível ler a imagem.");
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !description.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizen: session.name,
          zone: session.zone,
          category,
          description,
          binId: BIN_CATEGORIES.includes(category) ? binId || null : null,
          streetlightId: category === "poste_avariado" ? streetlightId || null : null,
          photo: category === "poste_avariado" ? photoDataUrl : null,
        }),
      });
      if (res.ok) {
        const { report } = await res.json();
        setReports((prev) => [report, ...prev]);
        const lightingRes = await fetch("/api/lighting").then((r) => r.json());
        setWorkOrders(lightingRes.workOrders);
        setDescription("");
        setBinId("");
        setStreetlightId("");
        setPhotoDataUrl(null);
        setJustSubmitted(true);
        setTimeout(() => setJustSubmitted(false), 4000);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-text-on-ink sm:text-3xl">
        Reportar um problema
      </h1>
      <p className="mt-1 text-sm text-text-on-ink-secondary">
        Fica registado de forma permanente — categoria e zona ficam no livro-razão
        público; o seu nome, descrição e fotos ficam apenas consigo.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-4 rounded-2xl border border-ink-3 bg-ink-2/50 p-6"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-on-ink-secondary">Categoria</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ReportCategory)}
            className="rounded-xl border border-ink-3 bg-ink-1 px-3 py-2.5 text-text-on-ink outline-none focus:border-accent/60"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        {BIN_CATEGORIES.includes(category) && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-text-on-ink-secondary">Contentor (opcional)</span>
            <select
              value={binId}
              onChange={(e) => setBinId(e.target.value)}
              className="rounded-xl border border-ink-3 bg-ink-1 px-3 py-2.5 text-text-on-ink outline-none focus:border-accent/60"
            >
              <option value="">Não associar a um contentor específico</option>
              {bins.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.level}%
                </option>
              ))}
            </select>
          </label>
        )}

        {category === "poste_avariado" && (
          <>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-text-on-ink-secondary">Poste (opcional)</span>
              <select
                value={streetlightId}
                onChange={(e) => setStreetlightId(e.target.value)}
                className="rounded-xl border border-ink-3 bg-ink-1 px-3 py-2.5 text-text-on-ink outline-none focus:border-accent/60"
              >
                <option value="">Não associar a um poste específico</option>
                {streetlights.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-text-on-ink-secondary">Foto (opcional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="rounded-xl border border-ink-3 bg-ink-1 px-3 py-2.5 text-sm text-text-on-ink-secondary outline-none file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent-ink"
              />
              {photoError && <span className="text-xs text-status-critical">{photoError}</span>}
              {photoDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoDataUrl}
                  alt="Pré-visualização da foto anexada"
                  className="mt-1 h-32 w-full rounded-lg object-cover"
                />
              )}
              <span className="text-xs text-text-on-ink-muted">
                Usada apenas para gerar a ordem de serviço — é apagada assim que o
                pedido é resolvido.
              </span>
            </label>
          </>
        )}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-on-ink-secondary">Descrição</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Descreva o que encontrou…"
            className="rounded-xl border border-ink-3 bg-ink-1 px-3 py-2.5 text-text-on-ink outline-none placeholder:text-text-on-ink-muted focus:border-accent/60"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {submitting ? "A submeter…" : "Submeter reporte"}
        </button>

        {justSubmitted && (
          <p className="rise-in text-sm text-status-good">
            ✓ Reporte registado no livro-razão.
          </p>
        )}
      </form>

      <h2 className="mt-10 text-sm font-medium text-text-on-ink">Os seus pedidos</h2>
      {reports.length === 0 ? (
        <p className="mt-3 text-sm text-text-on-ink-secondary">
          Ainda não submeteu nenhum pedido.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {reports.map((r) => {
            const workOrder = workOrders.find((wo) => wo.reportId === r.id);
            return (
              <li
                key={r.id}
                className="flex flex-col gap-2 rounded-xl border border-ink-3 bg-ink-2/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-text-on-ink">{r.description}</p>
                  <p className="mt-0.5 text-xs text-text-on-ink-muted">
                    {CATEGORIES.find((c) => c.value === r.category)?.label} · Zona {r.zone} ·{" "}
                    {new Date(r.createdAt).toLocaleString("pt-PT")}
                  </p>
                  {workOrder && (
                    <p className="mt-1 font-mono text-xs text-accent">
                      Ordem de serviço: {workOrder.reference}
                    </p>
                  )}
                </div>
                <ReportStatusBadge status={r.status} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
