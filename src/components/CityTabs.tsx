"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/city", label: "Contentores" },
  { href: "/city/lighting", label: "Iluminação" },
  { href: "/city/air", label: "Qualidade do ar" },
  { href: "/city/traffic", label: "Trânsito" },
];

export function CityTabs() {
  const pathname = usePathname();
  return (
    <div className="flex flex-wrap gap-5 border-b border-ink-3/60">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-1 pb-2 text-sm transition-colors ${
              active
                ? "border-accent text-text-on-ink font-medium"
                : "border-transparent text-text-on-ink-secondary hover:text-text-on-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
