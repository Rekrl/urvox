# Inventário de dados abertos reais para a área piloto (Viseu: Centro Histórico + Rossio)

> Ticket: [Rekrl/urvox#11](https://github.com/Rekrl/urvox/issues/11) · Mapa: [#9](https://github.com/Rekrl/urvox/issues/9)
> Investigado a 2026-11-02. Área piloto = bbox lat 40.654–40.663, lng −7.919 a −7.907.
> Método: sempre que possível consultei diretamente as APIs e os ficheiros de primeira mão (curl contra o endpoint oficial) em vez de resumos de terceiros. Os números abaixo resultam dessas chamadas e são de 2026-11-02, salvo indicação em contrário.

## Resumo

- **Há dados reais suficientes para um piloto credível**, mas quase nenhum é tempo real dentro da área. As exceções são a **meteorologia horária do IPMA** e a **ocupação em tempo real de 3 parques Semovepark** (através de uma API pública não documentada do MUV).
- **O melhor achado é a camada de contentores de resíduos do município** (portal CIMVDL, CC0): 3 285 contentores no concelho, **84 dentro da bbox**, em GeoJSON/SHP/CSV. É mais densa do que o OSM, mas não indica o tipo de contentor.
- **Na área piloto não há estação QualAr nem sensor comunitário.** A estação oficial mais próxima é Fornelo do Monte (Vouzela), rural de fundo, a cerca de 16 km. Para ar e ruído, o piloto teria de usar dados sintéticos ou sensores próprios.
- **Mobilidade:** não existe GTFS do MUV publicado (nem na Mobility Database nem no dados.gov.pt). O OSM tem as linhas do MUV bem mapeadas (20 linhas e 116 variantes de rota) e a API do MUV devolve horários por paragem.
- **3D:** o LiDAR da DGT (de 2024; MDS de 50 cm, LAZ com 10 pts/m², CC‑BY 4.0) cobre a área em 4 quadrículas, e há ortofotos de 2025 a 25 cm. O descarregamento exige uma conta gratuita no CDD. As alturas dos edifícios no OSM são quase inexistentes (2 de 1 681).
- **Contratos públicos:** o dataset do IMPIC no dados.gov.pt (semanal, JSON/XLSX) tem 438 contratos da Câmara e 99 dos SMAS em 2026. A localização só vem ao nível do concelho e o base.gov.pt não tem API pública documentada.

---

## 1. IPMA: meteorologia

| Campo | Detalhe |
|---|---|
| Conteúdo | Previsão diária a 5 dias por local, observações horárias por estação, índice UV, avisos meteorológicos |
| Cobertura da área | Previsão: `globalIdLocal=1182300` (Viseu, ponto 40.6585, −7.9120, **dentro da bbox**). Observação: a estação **"Viseu (Cidade)" `1240675`** fica em 40.6627, −7.9040, cerca de 250 m a leste do limite da bbox. **Mas não teve nenhuma observação nas últimas 24 h** (todos os valores `null` em `observations.json`). As estações com dados são **"Viseu (C.Coordenação)" `1200560`** (40.715, −7.896, ~6 km a norte) e **"Viseu (Aeródromo)" `1200559`** (~8 km), com dados horários completos (temperatura, humidade, vento, pressão, precipitação e radiação). Há também estações da rede CIM (por exemplo, Torredeita) |
| Granularidade | Previsão: 1 ponto por concelho, diária. Observação: horária e pontual |
| Atualização | Observações: de hora a hora (o ficheiro guarda as últimas 24 h). Previsões: várias vezes por dia |
| Formato/acesso | JSON sem chave: `https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/1182300.json`, `.../observation/meteorology/stations/observations.json`, `.../stations/stations.json`, `.../forecast/meteorology/uv/uv.json`, `.../forecast/warnings/warnings_www.json` (área de aviso `VIS`) |
| Licença/custo | Gratuito e sem registo. O IPMA pede que se leiam as "condições de utilização" e que se envie um email a webmaster@ipma.pt a informar da utilização ([api.ipma.pt](https://api.ipma.pt/)) |
| Qualidade | Boa, oficial e estável. Para o piloto, a escala urbana fina não existe: a cidade inteira é representada por um único valor |

## 2. APA / QualAr: qualidade do ar

| Campo | Detalhe |
|---|---|
| Estação mais próxima | **Fornelo do Monte (código 2021)**, concelho de Vouzela, em −8.100, 40.644, altitude de 731 m. Tipo **rural, de fundo**, zona Centro Interior, gerida pela CCDR Centro, ativa desde 2005. Fica a cerca de **16 km a oeste** da área piloto |
| Poluentes | PM10 (absorção beta), O₃, NO₂, NOx e NO (quimiluminescência). O SO₂ foi medido só entre 2005 e 2014 |
| Em Viseu? | **Não.** A lista oficial de estações (`download.php?type=estacoes`, 71 estações ativas, incluindo as inativas) não tem nenhuma estação no concelho de Viseu. A lista de estações "privadas" (`p=1`) está vazia |
| Granularidade | Horária, numa só estação. Não representa a qualidade do ar ao nível da rua no Centro Histórico |
| Acesso | O portal [qualar.apambiente.pt](https://qualar.apambiente.pt/) é uma SPA. O backend expõe endpoints sem autenticação: `api/app.php?type=estacao&estacao_id=2021` (metadados e poluentes), `api/app.php?type=stations`, `api/download.php?type=estacoes&p=0` (XLSX) e `api/download.php?poluente_id=…` (descarga de dados). **Não estão documentados**: foram obtidos a partir do JavaScript do portal |
| Licença | Não encontrei licença explícita no portal |
| Nota | Uma dissertação do IPV refere uma **estação municipal de monitorização do ar em Viseu** (adquirida no âmbito do POLIS em 2015, no CMIA) e compara-a com Fornelo do Monte nos anos 2019–2021 ([repositorio.ipv.pt](https://repositorio.ipv.pt/bitstreams/a51f05b3-68e9-44f2-a86b-48f39bf051f7/download)). **NÃO VERIFICADO:** não encontrei qualquer forma pública de aceder aos dados dessa estação |

## 3. Sensor.Community e outras redes comunitárias

| Rede | Resultado |
|---|---|
| Sensor.Community | `data.sensor.community/airrohr/v1/filter/area=40.657,-7.913,R` devolveu **0 sensores num raio de 10 km e de 30 km**. Num raio de 60 km aparece apenas 1 DHT22 (temperatura e humidade) em 41.09, −8.118, a cerca de 50 km. **Não há sensores em Viseu** |
| Smart Citizen | `api.smartcitizen.me/v0/devices?near=…`: os dispositivos mais próximos são de um projeto escolar em **Mangualde** (cerca de 15 km), e o último registo é de 2026‑06. Nada na cidade |
| openSenseMap | A pesquisa por bbox na região não devolveu nenhuma box relevante |
| Conclusão | Não existe hoje nenhuma rede comunitária utilizável para a área piloto |

## 4. INE: BGRI 2021 (população por subsecção estatística)

| Campo | Detalhe |
|---|---|
| Conteúdo | Geometria das secções e subsecções estatísticas (a subsecção corresponde aproximadamente a um quarteirão) com variáveis dos Censos 2021: indivíduos (`N_INDIVIDUOS`), edifícios, alojamentos, agregados, grupos etários, etc. |
| Cobertura | Nacional, por isso cobre a área. Na área piloto deverá haver dezenas de subsecções. **NÃO VERIFICADO:** não consegui contá-las |
| Granularidade | Subsecção (quarteirão); referência temporal: 2021 |
| Atualização | Decenal (Censos). Os limites mudam de censo para censo |
| Formato/acesso | Descarga gratuita em `mapas.ine.pt/download/index2021.phtml`, com ficheiros zip por concelho (padrão `BGRI2021_<DICO>.zip`; Viseu = `1823`) em GeoPackage ([doc. geopt](https://cran.r-universe.dev/geopt/doc/downloading-data.html); [nota da CM Cascais](https://cascais.pt/sites/default/files/anexos/gerais/new/13bgri_geopackage_censos_2021.pdf)) |
| Estado hoje | **NÃO VERIFICADO EM PRIMEIRA MÃO:** a 2026‑11‑02, o `mapas.ine.pt` redirecionava para uma página "Site temporariamente indisponível". Os nomes dos ficheiros, a licença e o CRS ficam por confirmar |
| Utilidade | É a camada de base para estimar a "população residente" por quarteirão. Não serve para fluxos de pessoas em tempo real |

## 5. OpenStreetMap: cobertura da bbox

Contagens obtidas a 2026‑11‑02 com uma consulta Overpass (`overpass-api.de`) sobre a bbox. Licença ODbL.

| Elemento | Contagem | Observação |
|---|---|---|
| Edifícios (`way[building]`) | **1 681** | Boa cobertura de pegadas |
| … com `height` | **2** | As alturas são quase inexistentes |
| … com `building:levels` | **49** (cerca de 3%) | Insuficiente para 3D. É preciso LiDAR (ver §6) ou valores por defeito |
| `amenity=recycling` (nós) | **29** | Etiquetas: papel (12), latas (11), vidro (10), plástico (10), orgânicos (6). 4 têm `fixme` |
| `amenity=waste_basket` | 43 | Papeleiras |
| `amenity=waste_disposal` | 28 | Contentores indiferenciados |
| `highway=street_lamp` | **17** | Muito incompleto: a área real terá centenas de candeeiros |
| `amenity=parking` | 189 (10 com `capacity`) | |
| `highway=bus_stop` | 60 | |
| Relações `route=bus` | 310 | **116 do MUV** (operador Berrelhas; linhas 01–09, 11–19, C1 e C2), 190 da MobiViseuDãoLafões (Vdl Mobilidade) e 4 de "STUV" |
| Vias com nome | cerca de 320 (consulta anterior, não repetida) | |

Avaliação: o OSM é **bom para a base cartográfica e para a rede de transportes**, **razoável para ecopontos**, e **fraco para iluminação e alturas**.

## 6. DGT: ortofotos e LiDAR

| Produto | Detalhe |
|---|---|
| **LiDAR (CDD)** | Coleções `LAZ` (nuvem de pontos classificada, ~10 pts/m²), `MDS-50cm`, `MDS-2m`, `MDT-50cm` e `MDT-2m`, todas sob **CC‑BY‑4.0**. A pesquisa STAC (`POST https://cdd.dgterritorio.gov.pt/dgt-be/v1/search` com a bbox) devolve **4 quadrículas que cobrem a área piloto** (`219410`, `219411`, `218410`, `218411`), com sufixo `-04-2024`, o que indica um voo de abril de 2024 (inferência a partir do nome). Formatos: GeoTIFF e LAZ. **O descarregamento exige login** (o link de descarga redireciona para `cdd.dgterritorio.gov.pt/auth/login`), numa conta gratuita. A diferença MDS − MDT dá a **altura dos edifícios** |
| **Ortofotos (CDD)** | Coleções `ORTOS-2025` (voo de março a julho de 2025, COG a 25 cm) e `ORTOS-2021`, ambas com 2 quadrículas sobre a área. Também existem as coleções 2018, 2015, 2012, 2010, 2007, 2004 e 1995. Licença indicada como "public". O descarregamento exige login |
| **Ortofotos (OGC API, sem login)** | `https://ogcapi.dgterritorio.gov.pt/collections`: `ortos-rgb` (**OrtoSat 30 cm, 2023**, satélite Pléiades‑Neo), `ortos2018-rgb` (25 cm) e anteriores. Têm o endpoint `.../collections/ortos-rgb/map?f=png` (OGC API – Maps). Esta API serve também as camadas CAOP2025, COS2023 e COS2025 |
| Atualização | O LiDAR é um levantamento único (2024). As ortofotos são atualizadas de poucos em poucos anos |

## 7. base.gov.pt / IMPIC: contratos públicos

| Campo | Detalhe |
|---|---|
| Fonte | Dataset do IMPIC no dados.gov.pt: ["Contratos Públicos - Portal Base - IMPIC - Contratos de 2012 a 2026"](https://dados.gov.pt/datasets/contratos-publicos-portal-base-impic-contratos-de-2012-a-2026), com datasets irmãos para Anúncios, Modificações Contratuais e Entidades |
| Formato | Um ficheiro por ano, em XLSX e/ou ZIP com JSON. Os campos incluem `objectoContrato`, `adjudicante`, `adjudicatarios`, `precoContratual`, `cpv`, `tipoprocedimento`, `localExecucao`, `dataCelebracaoContrato` e `prazoExecucao` |
| Atualização | Declarada como **semanal**. O ficheiro de 2026 foi atualizado a 2026‑11‑01 |
| Licença | `other-pd` (domínio público, segundo os metadados) |
| Viseu, 2026 | Câmara Municipal de Viseu (NIF 506697320): **438 contratos, cerca de 43,7 M€**. SMAS de Viseu (NIF 680020063): **99 contratos**. Publicações entre 2026‑01‑02 e 2026‑10‑30. Distribuição por tipo: 392 aquisições de serviços, 155 de bens e **58 empreitadas**. Pesquisa por palavras‑chave: iluminação (8), resíduos (15), pavimentação, requalificação e reabilitação (19) |
| Limitação | `localExecucao` só tem o nível do concelho ("Portugal, Viseu, Viseu"). **Não há geolocalização** e nenhum contrato menciona "Centro Histórico" ou "Rossio" no objeto. Para os colocar no mapa seria preciso fazer geocodificação manual ou heurística a partir do texto |
| API | **NÃO VERIFICADO:** não encontrei nenhuma API pública documentada do base.gov.pt. O caminho prático é o descarregamento em massa |

## 8. Portal de dados abertos da Câmara de Viseu e dados.gov.pt

| Fonte | Resultado |
|---|---|
| dados.gov.pt, organização **Município de Viseu** | Existe (criada em 2025‑10‑07) e as métricas indicam 1 dataset, mas **a API não devolve nenhum dataset público** (`/api/1/datasets/?organization=…` → 0). Na prática está vazia. A organização da CIM Viseu Dão Lafões também tem 0 datasets |
| dados.gov.pt, pesquisa "viseu" | Só datasets nacionais: Carta do Regime de Uso do Solo da DGT (Viseu), Atlas Urbano 2012 e Carta Geológica |
| **Portal CIMVDL** ([dadosabertos.cimvdl.pt](https://dadosabertos.cimvdl.pt), CKAN alojado pela primelayer) | 15 organizações (CIM + 14 municípios) com 6 datasets cada. Para **Viseu** (`concelho=1823`): Social, Rede Educativa, Hotelaria, Equipamentos Desportivos, Atividades Económicas e **Ambiente**. Licença **CC0**, metadados atualizados em 2026‑05‑19. Formatos GeoJSON, SHP e CSV, servidos por `pgeo.cimvdl.pt/opendata/get_<tema>_<formato>?concelho=1823` |
| **CIMVDL "Ambiente" (locais de recolha de resíduos)** | **3 285 contentores** no concelho, **84 dentro da bbox**. Cada ponto é um MultiPoint em WGS84 com `designacao` ("Contentor N") e `concelho`. **Não indica o tipo** (vidro, papel, indiferenciado…), a capacidade nem a frequência de recolha. Data de referência desconhecida |
| Site da Câmara (cm-viseu.pt) | Não tem secção de dados abertos nem geoportal ligado a partir da página inicial ou da de transparência. Os subdomínios testados (`dadosabertos.`, `sig.`, `geo.`, `geoportal.`) não resolvem. O Despacho n.º 688/2024 prevê um "portal de dados abertos" e um "Portal Viseu Smart" com dados de sensores ([vLex](https://vlex.pt/vid/despacho-n-688-2024-976911155)). **NÃO VERIFICADO:** não encontrei esse portal em funcionamento |

## 9. GTFS / MUV (autocarros urbanos) e estacionamento

| Fonte | Resultado |
|---|---|
| GTFS publicado | **Não existe.** O catálogo da [Mobility Database](https://files.mobilitydatabase.org/feeds_v2.csv) não tem nenhum feed de Viseu, do MUV, da Berrelhas ou da CIM VDL. Não encontrei nada no dados.gov.pt. **NÃO VERIFICADO:** não consegui ver o catálogo do NAP Portugal (nap-portugal.imt-ip.pt é uma SPA) |
| OSM | Tem as rotas do MUV mapeadas (ver §5): é a melhor fonte aberta da geometria das linhas |
| **API pública do MUV** (`muv.pt`, sem autenticação, **não documentada e sem licença**; endpoints extraídos do JS da app web) | `publictransportation/public/publictransportationstop/nearby?lat=&lng=&radius=`: paragens com **horários por linha** (por exemplo, "VIS 133 Segurança Social 1", linha L13, horas para dias úteis). `parkinglot/public/parkinglot?...`: **35 parques/zonas, todos dentro da bbox, 1 352 lugares** (zonas A/B tarifadas, Semovepark), com tarifas e horários (última atualização em 2023). `parkinglot/public/{id}/parkcapacity`: **ocupação em tempo real** (`occupancyPercentage`, `freePlaces`) nos parques Semovepark. Exemplo às 16h de 2026‑11‑02: id 1 Santa Cristina, 324 lugares, 83%. Os ids 2/39 e 3 também responderam, mas o mapeamento entre id e parque é inconsistente (o id 2 devolve 60 lugares, quando a lista o dá com 100). Para as zonas de rua responde "not possible to obtain information from the concessionaire". Há ainda endpoints para ciclovias, bicicletas (0 estações), DRT/Telebus e um simulador de viagens |
| Risco | O uso pode não estar autorizado e a API pode mudar sem aviso. Para produção é preciso pedir autorização à Câmara/MUV |

## 10. Contagens de tráfego públicas

- **Não encontrei contagens públicas para a cidade de Viseu.** O IMT publica o TMDA e o TMDM apenas para autoestradas ([Relatório de Tráfego 2025](https://www.imt-ip.pt/wp-content/uploads/2026/07/RelatoriodeTrafego-2025.pdf)): poderá incluir a A24 e a A25 junto a Viseu, mas não a malha urbana. **NÃO VERIFICADO:** não li o relatório para confirmar os sublanços de Viseu.
- A Infraestruturas de Portugal tem postos de contagem na rede nacional, mas não encontrei nenhuma publicação aberta para Viseu.
- O substituto mais próximo de um sinal de tráfego é a ocupação dos parques do MUV (§9).

## 11. Ruído e fluxo de pessoas/eventos (notas)

- **Ruído:** não há medição contínua aberta. Os mapas estratégicos e municipais de ruído (documentos do PDM e da APA) são estáticos. **NÃO VERIFICADO:** não procurei o mapa de ruído de Viseu.
- **Fluxo de pessoas/eventos:** não encontrei dados abertos. As fontes indiretas são o BGRI (residentes), a CIMVDL Hotelaria (POIs com capacidade?), os contratos do BASE com objetos de eventos (por exemplo, "Viseu Natal", "Feira de São Mateus") e a ocupação dos parques.

---

## Tabela: fontes mais promissoras por domínio candidato

| Domínio | Fonte(s) mais promissora(s) | Tempo real? | Notas |
|---|---|---|---|
| **Resíduos** | **CIMVDL Ambiente** (84 contentores na bbox, CC0) + OSM `recycling` (29, com tipo) + BASE (contratos de recolha) | Não | Cruzar o CIMVDL (posição) com o OSM (tipo). Os níveis de enchimento teriam de ser simulados |
| **Mobilidade/obras** | OSM (rotas MUV e vias) + API MUV (horários por paragem) + BASE (58 empreitadas em 2026; texto livre) | Parcial (horários) | Não há GTFS. As obras exigem geocodificar o texto dos contratos |
| **Iluminação** | OSM (17 candeeiros, muito incompleto) + BASE (8 contratos de iluminação) + ortofotos/LiDAR para inferir | Não | O domínio mais pobre em dados: a rede teria de ser sintetizada ao longo das vias |
| **Ar/ruído** | QualAr Fornelo do Monte (rural, a 16 km) + IPMA (meteorologia) | Sim, mas não local | Nenhum sensor na área. Valores ao nível da rua teriam de ser sintéticos ou vir de sensores próprios |
| **Estacionamento** | **API MUV `parkinglot`** (35 zonas, 1 352 lugares; ocupação ao vivo em 3 parques Semovepark) + OSM `parking` | **Sim** (3 parques) | O domínio com dados reais mais "vivos". API não documentada: pedir autorização |
| **Fluxo de pessoas/eventos** | BGRI 2021 (residentes por quarteirão) + ocupação de parques + BASE (eventos) + CIMVDL Hotelaria | Não | Não há contagens de pessoas. É preciso um modelo sintético calibrado com estas fontes |
| *Transversal (base 3D)* | **DGT LiDAR 2024** (MDS/MDT de 50 cm, CC‑BY) + ortofotos de 2025 a 25 cm + pegadas do OSM | — | Alturas dos edifícios = MDS − MDT nas pegadas do OSM. É preciso conta gratuita no CDD |

## O que NÃO consegui verificar

1. **INE BGRI 2021:** o `mapas.ine.pt` estava em manutenção a 2026‑11‑02. O URL, a licença, o CRS e o número de subsecções na bbox foram confirmados apenas por fontes secundárias.
2. **Estação de qualidade do ar municipal (CMIA/POLIS)** referida pelo IPV: não sei se está ativa nem se os dados são públicos.
3. **NAP Portugal:** não consegui consultar o catálogo, por isso não posso excluir a 100% que exista lá um GTFS do MUV.
4. **API do base.gov.pt:** não encontrei nenhuma documentada. Não testei endpoints internos.
5. **Portal de dados abertos / "Viseu Smart" da Câmara:** previsto em despacho, mas não o encontrei em funcionamento.
6. **Termos de uso da API do MUV:** não existem publicados. O mapeamento entre o id do parque e o id de ocupação é inconsistente.
7. **Data de referência da camada CIMVDL de contentores** e semântica dos tipos: não existem nos metadados.
8. **Data exata do voo LiDAR:** inferida do sufixo `-04-2024` dos ids das quadrículas.
9. **Estação IPMA "Viseu (Cidade)" 1240675:** não sei se a ausência de dados nas últimas 24 h é temporária ou permanente.
10. **Contagens de tráfego (IMT/IP)** para os sublanços de Viseu e **mapa de ruído municipal**: não verificados.

## Fontes (primárias, consultadas a 2026‑11‑02)

- IPMA API: https://api.ipma.pt/ (endpoints `open-data/…` listados em §1)
- QualAr (APA): https://qualar.apambiente.pt/ · `api/download.php?type=estacoes&p=0` · `api/app.php?type=estacao&estacao_id=2021`
- Sensor.Community: https://data.sensor.community/airrohr/v1/filter/area=40.657,-7.913,30
- Smart Citizen: https://api.smartcitizen.me/v0/devices?near=40.658,-7.913
- Overpass API: https://overpass-api.de/api/interpreter
- DGT CDD (STAC): https://cdd.dgterritorio.gov.pt/dgt-be/v1/collections · `/search`
- DGT OGC API: https://ogcapi.dgterritorio.gov.pt/collections
- IMPIC/BASE no dados.gov.pt: https://dados.gov.pt/datasets/contratos-publicos-portal-base-impic-contratos-de-2012-a-2026
- dados.gov.pt API: https://dados.gov.pt/api/1/organizations/municipio-de-viseu/
- Portal CIMVDL (CKAN): https://dadosabertos.cimvdl.pt/api/3/action/package_search?fq=organization:viseu · https://pgeo.cimvdl.pt/opendata/get_ambiente_geojson?concelho=1823
- MUV: https://muv.pt/ (endpoints em §9)
- Mobility Database: https://files.mobilitydatabase.org/feeds_v2.csv
- Secundárias (assinaladas no texto): dissertação IPV, docs do pacote R geopt, nota da CM Cascais, Despacho 688/2024 (vLex), Relatório de Tráfego IMT 2025
