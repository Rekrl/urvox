import Link from "next/link";
import { Logo } from "@/components/Logo";
import { StatCard } from "@/components/StatCard";
import {
  CitizenIcon,
  LeafIcon,
  LedgerIcon,
  ReportIcon,
  SensorIcon,
  TechIcon,
  TransparencyIcon,
} from "@/components/icons";

const PILLARS = [
  {
    icon: TechIcon,
    title: "Tecnologia integrada",
    text: "Sensores IoT, um livro-razão encadeado por hash e uma app do cidadão — a cobrir resíduos, iluminação, ar e trânsito num só lugar.",
  },
  {
    icon: CitizenIcon,
    title: "Cidadão no centro",
    text: "UX simples, controlo sobre os próprios dados e participação real — não apenas um painel de leitura.",
  },
  {
    icon: TransparencyIcon,
    title: "Transparência total",
    text: "Todo o evento relevante — reportes, recolhas, resoluções — fica registado e é publicamente verificável.",
  },
  {
    icon: LeafIcon,
    title: "Sustentabilidade",
    text: "Rotas otimizadas, menos combustível, menos emissões — impacto mensurável, não promessas.",
  },
];

const HOW = [
  {
    icon: SensorIcon,
    title: "1. A cidade em tempo real",
    text: "Contentores, postes de iluminação, ar e trânsito — cada um com o seu estado, aqui simulado para a demo.",
  },
  {
    icon: ReportIcon,
    title: "2. O cidadão participa",
    text: "Reporta problemas com foto, acompanha ordens de serviço e fica a par de obras e eventos, sem fricção.",
  },
  {
    icon: LedgerIcon,
    title: "3. Tudo fica registado",
    text: "Cada evento relevante entra num livro-razão encadeado por hash — auditável por qualquer pessoa.",
  },
];

const ROADMAP = [
  { phase: "Fase 0", label: "Fundações" },
  { phase: "Fase 1", label: "Envolvimento do cidadão" },
  { phase: "Fase 2", label: "Transparência e confiança" },
  { phase: "Fase 3", label: "Ecossistema completo" },
  { phase: "Fase 4", label: "Otimização e escala" },
];

export default function LandingPage() {
  return (
    <div className="bg-ink-0">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Logo tagline />
        <Link
          href="/login"
          className="rounded-full border border-ink-3 px-4 py-2 text-sm text-text-on-ink-secondary transition-colors hover:border-accent/60 hover:text-text-on-ink"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pb-20 pt-10 text-center sm:px-6 sm:pt-16">
        <p className="rise-in inline-flex items-center gap-2 rounded-full border border-ink-3 bg-ink-2/60 px-3 py-1 text-xs uppercase tracking-widest text-text-on-ink-muted">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-signal" />
          Piloto SmartCity · Vilanova
        </p>
        <h1 className="rise-in font-display mt-6 text-4xl leading-[1.1] text-text-on-ink sm:text-6xl">
          Cada contentor, cada pedido, cada decisão —
          <span className="text-accent"> a cidade tem voz</span>, e essa voz
          fica à prova de alteração.
        </h1>
        <p className="rise-in mt-6 text-balance text-lg text-text-on-ink-secondary">
          Resíduos, iluminação, qualidade do ar, trânsito e as notícias da câmara —
          num único espaço entre cidade, cidadão e autarquia, com um livro-razão
          público e à prova de alteração no centro. Este protótipo prova a ideia
          com dados simulados — a arquitetura é a mesma que escalaria para uma
          cidade inteira.
        </p>
        <div className="rise-in mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover sm:w-auto"
          >
            Experimentar a demo
          </Link>
          <Link
            href="/transparency"
            className="w-full rounded-full border border-ink-3 px-6 py-3 text-sm text-text-on-ink-secondary transition-colors hover:border-accent/50 hover:text-text-on-ink sm:w-auto"
          >
            Ver o registo público
          </Link>
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-y border-ink-3/60 bg-ink-1/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl text-text-on-ink sm:text-3xl">
            Como funciona
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {HOW.map((step) => (
              <div key={step.title} className="rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
                <step.icon className="h-7 w-7 text-accent" />
                <h3 className="mt-4 font-medium text-text-on-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-on-ink-secondary">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl text-text-on-ink sm:text-3xl">
          Os quatro pilares
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
              <pillar.icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 text-sm font-medium text-text-on-ink">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-on-ink-secondary">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact preview */}
      <section className="border-y border-ink-3/60 bg-ink-1/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl text-text-on-ink sm:text-3xl">
            O potencial à escala da cidade
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-text-on-ink-secondary">
            Projeções do plano original para otimização de rotas de recolha
            assistida por IA — a referência de impacto que este piloto ajuda a
            validar.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Distância percorrida" value="-29%" tone="good" />
            <StatCard label="Tempo de recolha" value="-34%" tone="good" />
            <StatCard label="Combustível" value="-1 240€/mês" tone="good" />
            <StatCard label="Emissões de CO₂" value="-850 kg/mês" tone="good" />
          </div>
        </div>
      </section>

      {/* Roadmap teaser */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl text-text-on-ink sm:text-3xl">
          Este piloto é a Fase 0
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-on-ink-secondary">
          Parte de um roadmap de 18 meses para um ecossistema SmartCity completo
          — blockchain de governação, IoT à escala urbana e serviços cívicos
          digitais. Começamos aqui, com uma fatia real e demonstrável.
        </p>
        <ol className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {ROADMAP.map((r, i) => (
            <li
              key={r.phase}
              className={`flex items-center gap-3 rounded-full border px-4 py-2 text-sm ${
                i === 0
                  ? "border-accent/60 bg-accent/10 text-text-on-ink"
                  : "border-ink-3 text-text-on-ink-secondary"
              }`}
            >
              <span className="font-mono text-xs text-text-on-ink-muted">
                {r.phase}
              </span>
              {r.label}
            </li>
          ))}
        </ol>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-24 pt-6 text-center sm:px-6">
        <h2 className="font-display text-3xl text-text-on-ink">
          Pronto para ver o Urvox em ação?
        </h2>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          Entrar na demo
        </Link>
      </section>

      <footer className="border-t border-ink-3/60 px-4 py-8 text-center sm:px-6">
        <p className="hash-texture text-xs">
          urvox · protótipo de demonstração · dados simulados · nenhum dado real é
          recolhido
        </p>
      </footer>
    </div>
  );
}
