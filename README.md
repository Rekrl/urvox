# Urvox

**A cidade tem voz.** O espaço central que liga cidade, cidadão e câmara.

## Parte 1 — A ideia

Uma câmara municipal toma todos os dias decisões sobre a cidade: quantas vezes
recolher o lixo numa rua, que rua cortar para obras e por quanto tempo, onde
trocar a iluminação por LED. Quase sempre decide sem conseguir ver antes o
efeito dessas decisões. E, depois de decidir, raramente consegue mostrar se o
efeito foi o que se esperava.

O Urvox propõe um **digital twin** de uma parte real de Viseu: uma réplica
digital da cidade (geografia, ativos e estado), alimentada por dados reais
onde existam e por simulação calibrada onde ainda não existam. Serve para
**prever o efeito de uma decisão antes de a tomar**. Cada previsão que suporta
uma decisão fica registada de forma verificável (a **previsão registada**) e
mais tarde é comparada com o que foi medido. Assim, o apoio à decisão vem
acompanhado de prestação de contas.

### Área piloto

O **Centro Histórico e o Rossio de Viseu** (Sé, Rua Direita, Praça da
República). É uma área pequena e reconhecível, onde quem decide identifica as
próprias ruas. O público principal do piloto é a **Câmara Municipal de Viseu**,
e a **UPV** (antigo IPV) é o parceiro académico em vista.

### Princípios do piloto

- **Território real, dados honestos.** Geografia e ativos reais
  (OpenStreetMap). Onde os dados são simulados, isso está sempre à vista.
- **Dados abertos primeiro.** Meteorologia, qualidade do ar, Censos,
  contratos públicos e outras fontes que já existem, antes de qualquer
  hardware novo.
- **Nenhum hardware em espaço público sem parceria formal.** Um sensor
  próprio, a existir, fica em propriedade privada e com consentimento.
- **Ferramenta da câmara.** O digital twin vive na área de administração. A
  relação com o cidadão (reportes, notícias, transparência) é um esforço
  próprio, a revisitar depois do piloto.

### Estado atual (para ser transparente sobre isso também)

- **O que existe:** um protótipo navegável com o mapa real da área piloto.
  Contentores e postes estão em localizações reais do OpenStreetMap, mas as
  leituras dos sensores são geradas por software. O livro-razão é uma cadeia
  de hashes real que corre localmente, e o login é simbólico. As páginas do
  cidadão (reportes, notícias, transparência) vêm da fase anterior do
  projeto e mantêm-se como estão.
- **Em decisão:** que decisões municipais o digital twin apoia, com que dados
  e com que previsões. O mapa de trabalho está em
  [Digital twin do Centro Histórico de Viseu: spec do piloto](https://github.com/Rekrl/urvox/issues/9).

### Como o trabalho é acompanhado

- **Mapa e tickets:** no GitHub, com as skills de agentes de
  [mattpocock/skills](https://github.com/mattpocock/skills)
  (`/wayfinder`, `/to-tickets`, `/triage`…). A configuração está em
  `docs/agents/`.
- **Vocabulário do domínio:** `GLOSSARY.md`.
- **Decisões de arquitetura:** `docs/adr/`.

## Parte 2 — Detalhes técnicos

### Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4, num único projeto que
cobre frontend e backend (API routes). Sem base de dados externa — estado em
memória no processo do servidor, propositadamente simples para esta fase de
demonstração. Sem dependências pagas ou chaves de API — corre em qualquer
máquina só com `npm install`. Mapa com [MapLibre GL](https://maplibre.org/) e
tiles vetoriais gratuitos da [OpenFreeMap](https://openfreemap.org/) (dados ©
OpenStreetMap): não precisa de chave, mas precisa de ligação à internet.

### Identidade visual

Marca monocromática (petróleo `#0A1310` + quase-branco `#F3F1E6`), com um
único acento lima (`#C6FF4F`) reservado exclusivamente ao indicador "ao
vivo"/registo — nunca usado na marca em si. Símbolo: um telhado (a
instituição cívica) do qual emanam arcos de voz — "a cidade a falar", não um
equalizador. Tipografia: Fraunces para títulos, IBM Plex Sans para o corpo,
IBM Plex Mono para elementos técnicos (hashes, timestamps). Implementado em
`src/components/Logo.tsx` (`LogoMark` aceita uma variante `compact` para
escalas pequenas e `animated` para contextos "ao vivo").

### Como correr

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). A app popula-se
sozinha com dados simulados assim que a primeira página carrega (não é
preciso nenhum passo de setup de base de dados).

### Estrutura do projeto

```
src/
  app/            páginas (App Router) e rotas de API
    city/         hub "Cidade" — contentores, iluminação, ar, trânsito
    report/       fluxo de reporte do cidadão (com upload de foto)
    transparency/ explorador do livro-razão público
    news/         notícias e alertas municipais
    dashboard/    painel pessoal do cidadão
    api/          rotas de API (bins, lighting, air, traffic, news, reports, ledger)
  components/     componentes de UI reutilizáveis (mapa, badges, gráficos)
  lib/            modelo de dados, simulador, livro-razão (hash-chain), paleta de cores
```

### Como funciona o livro-razão

Cada evento relevante (contentor crítico, recolha, reporte criado/resolvido,
poste avariado/reparado, ar crítico) gera um bloco com o hash do bloco
anterior — uma cadeia de hashes clássica (`src/lib/ledger.ts`). A rota
`/transparency` recomputa e verifica a cadeia inteira a cada carregamento, e
mostra o resultado publicamente. Dados pessoais (nome, descrição, fotos)
nunca entram nesta cadeia — só ficam associados ao reporte em memória, e as
fotos são apagadas quando o pedido é resolvido.
