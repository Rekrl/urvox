"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { setSession } from "@/lib/auth";
import type { Zone } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [zone, setZone] = useState<Zone>("A");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSession({ name: trimmed, zone });
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-ink-0 px-4 py-16">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-ink-3 bg-ink-2/60 p-7">
        <h1 className="font-display text-xl text-text-on-ink">
          Identidade digital
        </h1>
        <p className="mt-1 text-sm text-text-on-ink-secondary">
          Nível básico, apenas para esta demonstração — sem palavra-passe, sem
          dados reais.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-text-on-ink-secondary">O seu nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Maria Sousa"
              required
              className="rounded-xl border border-ink-3 bg-ink-1 px-3 py-2.5 text-text-on-ink outline-none placeholder:text-text-on-ink-muted focus:border-accent/60"
            />
          </label>

          <fieldset className="flex flex-col gap-1.5 text-sm">
            <legend className="mb-1 text-text-on-ink-secondary">A sua zona</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["A", "B"] as const).map((z) => (
                <label
                  key={z}
                  className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center transition-colors ${
                    zone === z
                      ? "border-accent/60 bg-accent/10 text-text-on-ink"
                      : "border-ink-3 text-text-on-ink-secondary"
                  }`}
                >
                  <input
                    type="radio"
                    name="zone"
                    value={z}
                    checked={zone === z}
                    onChange={() => setZone(z)}
                    className="sr-only"
                  />
                  Zona {z} — {z === "A" ? "Centro Histórico" : "Rossio / Baixa"}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="mt-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Entrar na demo
          </button>
        </form>
      </div>

      <p className="hash-texture mt-8 max-w-sm text-center text-xs">
        urvox · a identidade fica apenas neste dispositivo (localStorage) · nada é
        enviado para um servidor real
      </p>
    </div>
  );
}
