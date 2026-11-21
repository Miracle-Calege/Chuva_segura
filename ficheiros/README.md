# 🌊 Chuva Segura MZ — alertas de cheias, ciclones e secas

Aplicação Web em **Vue.js 3** que ajuda as famílias moçambicanas a **prepararem-se para cheias, ciclones e secas**: mostra o risco de cada perigo na sua localidade, sugere **onde se abrigar em terreno mais alto**, permite à comunidade **avisar que vias estão fechadas e que caminhos alternativos usar**, e envia o **alerta por SMS**, que chega a qualquer telemóvel, mesmo sem Internet.

Projecto Final de Programação Web II — LECC31, ISUTC, 2.º semestre de 2026 (Docente: Ivan Ruby) — **Grupo 5**.

🔗 **Aplicação publicada:** https://UTILIZADOR.github.io/pwebii-2026-grupo5-chuva-segura/
📁 **Repositório:** https://github.com/UTILIZADOR/pwebii-2026-grupo5-chuva-segura

## Problema que resolve

Moçambique está entre os países africanos mais expostos a desastres naturais: na época chuvosa, ciclones tropicais e cheias atingem sobretudo as zonas baixas e as margens dos rios (Limpopo, Zambeze, Búzi, Púnguè, Licungo), e no interior e no sul há períodos de seca. Quando o perigo chega, as pessoas precisam de saber **três coisas**: se o risco é real na sua zona, **para onde ir** e **por onde ir**. Hoje essa informação está dispersa, é técnica, chega tarde e quase sempre pela Internet, que muitos não têm.

## Funcionalidades

| Página | Rota | O que faz |
|---|---|---|
| Alertas | `#/` | Avisos internacionais activos para Moçambique (GDACS), eventos dos últimos 12 meses e o nível de alerta das 11 capitais provinciais (num **único** pedido) |
| Pesquisa | `#/pesquisa?q=…` | Qualquer cidade, vila ou aldeia de Moçambique |
| Riscos da localidade | `#/cidade/:id` | Nível de alerta geral e detalhe de **cheia** (chuva de 7 dias + caudal do rio), **ciclone/vento** (rajadas) e **seca** (balanço de água dos últimos 30 dias); últimos relatos da comunidade |
| Onde me abrigar | `#/abrigos?cidade=…` | **Centros de acomodação usados em cheias e ciclones anteriores** na província (quase sempre escolas), com o evento e a fonte de cada um; e outros edifícios públicos em terreno mais alto perto do utilizador (OpenStreetMap + altitude), com distância e caminho no mapa |
| Vias e relatos | `#/comunidade?cidade=…` | Relatos de vias fechadas, zonas alagadas, pontes danificadas, abrigos abertos e **caminhos alternativos**; confirmar («ainda é verdade») e denunciar; apagam-se ao fim de 72 h. Sem servidor, funciona em modo de demonstração (relatos guardados só no aparelho) |
| Alerta por SMS | `#/cidade/:id/sms` | Formulário com validação do telemóvel (+258 82–87) e envio do resumo por SMS; botão para enviar o mesmo texto a familiares pela app de SMS do telemóvel |
| Página não encontrada | qualquer outra | Mensagem e ligações de regresso |

Cuidados com os dados móveis e a ligação instável: respostas guardadas em cache (memória + `localStorage`), pedidos iguais juntados, pausa de 500 ms na pesquisa, tempo limite em todos os pedidos, mensagens de erro claras com «Tentar novamente», ícones em SVG (sem imagens) e páginas carregadas só quando abertas.

### Como é avaliado o risco

Critérios definidos pelo grupo (`src/utils/risco.js`), **não** são os critérios oficiais do INAM/INGD:

| Perigo | Moderado | Alto | Muito alto |
|---|---|---|---|
| Cheia | chuva ≥ 20 mm num dia | ≥ 50 mm num dia | ≥ 100 mm num dia ou ≥ 150 mm em 3 dias; o nível sobe se o caudal do rio previsto for ≥ 2× o normal dos últimos 30 dias |
| Ciclone / vento | rajadas ≥ 60 km/h | vento ≥ 62 km/h ou rajadas ≥ 90 km/h | vento ≥ 89 km/h ou rajadas ≥ 118 km/h |
| Seca | balanço (chuva − evaporação, 30 dias) ≤ −60 mm e ≥ 14 dias sem chuva | ≤ −100 mm, ≥ 21 dias e < 10 mm previstos | ≤ −130 mm, ≥ 30 dias e < 5 mm previstos (desce um nível de Maio a Outubro, a época seca) |

## Fontes de dados

| Fonte | Utilização | Licença |
|---|---|---|
| [Open-Meteo Forecast API](https://open-meteo.com/en/docs) | Chuva, vento, rajadas e evapotranspiração (últimos 30 dias + 7 dias de previsão) | CC BY 4.0 |
| [Open-Meteo Flood API](https://open-meteo.com/en/docs/flood-api) (GloFAS, Copernicus) | Caudal dos rios | CC BY 4.0 |
| [Open-Meteo Elevation API](https://open-meteo.com/en/docs/elevation-api) (Copernicus DEM) | Altitude dos possíveis abrigos e do utilizador | CC BY 4.0 |
| [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) ([GeoNames](https://www.geonames.org)) | Localidades de Moçambique (`countryCode=MZ`) | CC BY 4.0 |
| [OpenStreetMap](https://www.openstreetmap.org) via [Overpass API](https://overpass-api.de) | Edifícios públicos perto da localidade | ODbL |
| [GDACS](https://www.gdacs.org) (ONU / Comissão Europeia) | Ciclones, cheias e secas que afectam Moçambique; copiados para `public/dados/gdacs-mz.json` pelo GitHub Actions a cada publicação e de 3 em 3 horas (`npm run dados`) | Dados públicos, com citação da fonte |
| `public/dados/centros-acomodacao.json` | 22 centros de acomodação usados em cheias e ciclones (2013–2026), recolhidos a 21/11/2026 de notícias e relatórios públicos (AIM, Lusa, OMS, UNICEF, OCHA, World Vision, Club of Mozambique); cada registo indica a fonte | Citação das fontes |
| `public/dados/capitais-provinciais.json` | Coordenadas das 11 capitais (GeoNames, recolhido a 21/11/2026) | CC BY 4.0 |

## SMS e comunidade (sem chaves expostas)

O GitHub Pages só serve ficheiros estáticos, por isso o **SMS** (Twilio) e os **relatos da comunidade** (Redis da Upstash) passam por duas funções serverless na **Vercel**, na pasta [`servidor/`](servidor/README.md). As chaves da Twilio e do Redis ficam **só** nas variáveis de ambiente da Vercel; a aplicação conhece apenas o endereço público das funções (`VITE_API_URL`).

Protecções: CORS limitado ao nosso domínio, só telemóveis de Moçambique, só textos gerados pela aplicação, limite de envios por pessoa e por número, relatos sem telefones/e-mails/ligações, denúncias e expiração automática em 72 h.

## Correr o projecto localmente

Requisitos: Node.js 20.19 ou superior (recomendado 22).

```bash
npm install
cp .env.example .env   # preencher VITE_API_URL (endereço do servidor na Vercel)
npm run dev
```

Outros comandos: `npm run build`, `npm run preview` e `npm run dados` (actualiza a cópia dos avisos do GDACS).

### Variáveis de ambiente

| Onde | Variável | Descrição |
|---|---|---|
| Aplicação (`.env` e GitHub → Actions → Variables) | `VITE_API_URL` | Endereço do servidor na Vercel (público) |
| Servidor (Vercel) | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_NUMERO` | Conta e número da Twilio |
| Servidor (Vercel) | `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Redis da Upstash (criadas pela Vercel) |
| Servidor (Vercel) | `ORIGENS_PERMITIDAS`, `SAL_IP` | Domínios autorizados e texto secreto para anonimizar IP |

## Publicação no GitHub Pages

`base: '/pwebii-2026-grupo5-chuva-segura/'` em `vite.config.js`, `createWebHashHistory()` no Vue Router e publicação automática com GitHub Actions (`.github/workflows/deploy.yml`).

## Estrutura do projecto

```
src/
├── assets/main.css      estilos globais (mobile-first, cartões de vidro, animações)
├── components/          componentes reutilizáveis (props + emits), ícones animados em SVG
├── composables/         usePrevisaoCidade, useCapitais, useAvisosGdacs, useAbrigos, useLocalizacao,
│                        useRelatos, useFormularioSms, useFormularioRelato, usePesquisaCidades, …
├── router/index.js      rotas (hash history)
├── services/            http (cache e erros), openMeteo, gdacs, abrigos, comunidade, sms, servidor
├── utils/               risco (cheia, vento, seca), tempo, geo
└── views/               HomeView, PesquisaView, CidadeView, AbrigosView, ComunidadeView, SmsView, NotFoundView
servidor/                funções serverless (Vercel): api/sms.js, api/relatos.js
scripts/                 actualizar-gdacs.mjs
public/dados/            capitais provinciais e cópia dos avisos do GDACS
```

## Membros do grupo

| Nome | N.º de estudante | Utilizador GitHub |
|---|---|---|
| Ivan Jaime Antonio | _____ | @_____ |
| Miracle Calege | _____ | @_____ |
| Télcio Calege | _____ | @_____ |
| Régio Abibo | _____ | @_____ |

## Tecnologias e bibliotecas

[Vue 3](https://vuejs.org) (Composition API, `<script setup>`), [Vue Router](https://router.vuejs.org), [Vite](https://vite.dev); no servidor, funções Node.js na [Vercel](https://vercel.com), [Twilio](https://www.twilio.com) (SMS) e [Upstash Redis](https://upstash.com). Sem outras bibliotecas.

## Uso de ferramentas de IA

_(Exigido na secção 9 do enunciado — o grupo deve rever e ajustar este texto.)_

- **Claude (Anthropic):** apoio na organização da estrutura do projecto, em sugestões de código para os componentes, composables, serviços e funções serverless, e na redacção deste README. Todo o código foi revisto, testado e adaptado pelo grupo, que o compreende e é responsável por ele.
