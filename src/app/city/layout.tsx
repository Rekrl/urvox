import { CityTabs } from "@/components/CityTabs";

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-text-on-ink sm:text-3xl">Cidade</h1>
      <p className="mt-1 text-sm text-text-on-ink-secondary">
        Contentores, iluminação, ar e trânsito — sensores simulados, atualizados ao vivo.
      </p>
      <div className="mt-5">
        <CityTabs />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
