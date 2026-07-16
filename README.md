# Urvox

**A cidade tem voz.** O espaço central que liga cidade, cidadão e câmara.

## Parte 1 — A ideia

Hoje, um cidadão que quer saber se a recolha de lixo está atrasada, reportar
um poste de iluminação avariado, perceber se há obras na sua rua, saber que a
Feira de S. Mateus é já para a semana, ou confirmar que o dinheiro público é
gasto como prometido, tem de lidar com vários sistemas desligados entre si —
ou, na maioria das vezes, com nenhum.

O Urvox propõe juntar tudo isto num único espaço: **o ponto de encontro entre a
cidade (os seus sensores e dados), o cidadão (que participa e é ouvido) e a
câmara (que comunica e presta contas)**. O princípio central que atravessa
toda a plataforma é simples de dizer e difícil de fingir: **cada evento
relevante fica registado de forma pública e à prova de alteração**, para que
a confiança entre cidade e cidadão não dependa de "acreditar por acreditar" —
dependa de se poder verificar.

Este projeto nasceu a partir de um trabalho académico teórico sobre
ecossistemas SmartCity (blockchain, IoT, participação cívica) e está agora a
ser transformado num protótipo real, para validar a ideia junto de
potenciais interessados — câmaras, parceiros, investidores. O que existe hoje
no código é uma **demonstração funcional e clicável** da ideia (com dados
simulados onde ainda não há sensores ou infraestrutura reais por trás), não
um produto acabado.

### O que a plataforma cobre

- **A cidade em tempo real** — estado dos contentores, iluminação pública,
  qualidade do ar e trânsito, tudo num único painel.
- **A voz do cidadão** — reportar problemas (com foto, quando faz sentido) e
  acompanhar o que acontece a seguir, sem se perder em burocracia.
- **A câmara a comunicar** — obras, cortes de via, eventos e avisos, num só
  lugar que qualquer cidadão pode consultar.
- **Confiança verificável** — um livro-razão público onde ficam registados os
  eventos que importam (não os dados pessoais), auditável por qualquer pessoa.
- **Privacidade como valor, não como letra pequena** — o cidadão controla o
  que partilha, e o que já não é preciso é apagado, não apenas prometido.

### Ideias para o futuro

Isto é o ponto de partida, não o destino. Algumas direções em que a ideia
pode crescer:

- **Mapas reais** — trocar a ilustração atual por uma integração com Google
  Maps, Mapbox ou OpenStreetMap, com a localização real de contentores,
  postes, estações de monitorização e do próprio cidadão.
- **Blockchain pública** — mover o livro-razão para uma rede real (ex.
  Polygon), para que a verificação deixe de depender só do Urvox e passe a
  ser independente por natureza.
- **Sensores e câmaras reais** — hardware de monitorização de resíduos e ar,
  ligação às câmaras de tráfego já existentes na cidade.
- **Um canal para a câmara** — uma vista de gestão para a autarquia acompanhar
  e fechar ordens de serviço, publicar notícias, e gerir o que entra no
  livro-razão.
- **Identidade digital real** — substituir o login simbólico de hoje por
  autenticação verificada (ex. Chave Móvel Digital).
- **Participação cívica** — orçamento participativo, votação municipal,
  propostas dos cidadãos — o próximo passo natural depois da transparência.
- **Notificações relevantes** — avisos por push/email quando algo importa
  para a zona ou os interesses do cidadão.
- **Mais serviços municipais** — transportes públicos, agendamentos de
  saúde, licenciamento — o Urvox como porta de entrada única para a relação
  com o município, não só para resíduos e iluminação.
- **Dados abertos** — uma API pública para investigadores, universidades e
  empresas construírem em cima dos dados não sensíveis da cidade.

### Estado atual (para ser transparente sobre isso também)

O que já existe é um protótipo navegável com todas as áreas acima
representadas — mas, propositadamente, com simulação em vez de infraestrutura
real: os sensores são gerados por software, o mapa é uma ilustração própria,
o livro-razão é uma cadeia de hashes real mas corre localmente, e o login é
simbólico. Cada uma destas simplificações está sinalizada na própria
interface, para quem experimenta a demo saber sempre o que é real e o que é
ilustrativo.

## Parte 2 — Detalhes técnicos

### Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4, num único projeto que
cobre frontend e backend (API routes). Sem base de dados externa — estado em
memória no processo do servidor, propositadamente simples para esta fase de
demonstração. Sem dependências pagas ou chaves de API — corre em qualquer
máquina só com `npm install`.

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
