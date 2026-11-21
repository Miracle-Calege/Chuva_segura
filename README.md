# Chuva Segura MZ

Aplicação web que mostra, para qualquer localidade de Moçambique, o risco de cheia, de ciclone e de seca nos próximos dias, indica para onde ir se for preciso sair de casa e deixa a comunidade registar que vias estão cortadas e que caminhos alternativos existem. O resumo do risco pode ser enviado por SMS, e quem o recebe não precisa de Internet para o ler.

Projecto final de Programação Web II (LECC31, ISUTC, 2.º semestre de 2026), docente Ivan Ruby. Grupo 5.

- Aplicação publicada: https://miracle-calege.github.io/Chuva_segura/
- Repositório: https://github.com/Miracle-Calege/Chuva_segura

## O problema

Na época chuvosa, os ciclones tropicais e as cheias afectam todos os anos o país, sobretudo as zonas baixas e as margens de rios como o Limpopo, o Zambeze, o Búzi, o Púnguè e o Licungo. No interior e no sul há também períodos de seca. Quem vive numa zona exposta tem de responder depressa a três perguntas: o perigo é real onde estou, para onde posso ir e por onde posso ir.

A informação para responder existe, mas está espalhada por várias fontes e quase nunca vem pensada para o telemóvel. O projecto junta essas respostas num só sítio, com páginas leves e com cuidado para as ligações lentas e os dados móveis caros.

## O que a aplicação faz

| Página | Rota | Conteúdo |
|---|---|---|
| Alertas | `#/` | Avisos activos do GDACS para Moçambique, eventos dos últimos 12 meses e o nível de risco das 11 capitais provinciais, obtido num único pedido |
| Pesquisa | `#/pesquisa?q=…` | Procura de cidades, vilas e aldeias de Moçambique |
| Riscos da localidade | `#/cidade/:id` | Nível geral e detalhe de cheia, ciclone e seca, com conselhos para cada nível, e os últimos relatos da comunidade sobre essa zona |
| Onde me abrigar | `#/abrigos` | Centros de acomodação usados em cheias e ciclones anteriores na província, com o evento e a fonte de cada um, e edifícios públicos em terreno alto perto do utilizador |
| Vias e relatos | `#/comunidade` | Relatos de vias fechadas, zonas alagadas, pontes danificadas, abrigos abertos e caminhos alternativos |
| Alerta por SMS | `#/cidade/:id/sms` | Envio do resumo do risco por SMS, com validação do número |

Algumas decisões de funcionamento merecem explicação.

**Onde me abrigar.** Os 22 centros de acomodação do ficheiro `public/dados/centros-acomodacao.json` foram recolhidos a 21/11/2026 em notícias e relatórios públicos sobre cheias e ciclones entre 2013 e 2026 (AIM, Lusa, OMS, UNICEF, OCHA, World Vision, Club of Mozambique). Cada registo indica a fonte. A lista é filtrada pela província e ordenada pela distância. Para os edifícios em terreno alto, a aplicação pergunta ao OpenStreetMap (Overpass) por escolas, unidades de saúde, edifícios públicos e pontos de reunião num raio de 4 km. Depois obtém a altitude de cada um e do utilizador na Open-Meteo e ordena por uma pontuação em que subir de altitude conta muito, a distância penaliza e os edifícios mais adequados ganham pontos. A localização do telemóvel só é pedida quando o utilizador carrega no botão.

**Relatos da comunidade.** Cada relato tem tipo, local, descrição e, opcionalmente, um caminho alternativo. Outros utilizadores podem confirmar que ainda é verdade ou denunciar; com 3 denúncias o relato deixa de aparecer. Os relatos apagam-se ao fim de 72 horas, porque o estado das vias muda depressa. O servidor recusa textos com números de telefone, e-mails ou ligações. Sem servidor configurado, a página funciona em modo de demonstração e guarda os relatos apenas no aparelho (`localStorage`).

**SMS.** O número é validado no formato de telemóvel de Moçambique (`+258` seguido de 82 a 87 e mais sete dígitos). O texto é montado sem acentos para caber, na maioria dos casos, numa só mensagem de 160 caracteres. Há ainda um botão que abre a app de SMS do telemóvel com o mesmo texto, para reencaminhar a familiares sem passar pelo servidor.

**Ligações fracas.** As respostas das APIs ficam em cache (memória e `localStorage`) durante um prazo que depende do tipo de dado: 1 hora para a previsão, 3 horas para o caudal dos rios, 1 dia para a pesquisa de localidades, 7 dias para os dados de uma localidade e 30 dias para as altitudes. Pedidos iguais feitos ao mesmo tempo são juntados num só, todos os pedidos têm tempo limite (15 segundos por omissão) e os erros aparecem em português, com o botão «Tentar novamente». Os ícones são SVG, sem imagens, e cada página só é descarregada quando é aberta.

## Como o risco é calculado

Os critérios estão em `src/utils/risco.js`. São critérios do grupo, escolhidos para alertar cedo, e **não** são os critérios oficiais do INAM nem do INGD. Para cada perigo a aplicação calcula um nível (baixo, moderado, alto ou muito alto) a partir dos 30 dias anteriores e dos 7 dias de previsão da Open-Meteo. O nível geral de uma localidade é o do perigo mais grave; em caso de empate, a ordem é cheia, ciclone, seca.

| Perigo | Moderado | Alto | Muito alto |
|---|---|---|---|
| Cheia | chuva de 20 mm ou mais num dia | 50 mm ou mais num dia | 100 mm ou mais num dia, ou 150 mm ou mais em 3 dias seguidos |
| Ciclone e vento | rajadas de 60 km/h ou mais | vento médio de 62 km/h ou mais, ou rajadas de 90 km/h ou mais | vento médio de 89 km/h ou mais, ou rajadas de 118 km/h ou mais |
| Seca | balanço hídrico de −60 mm ou menos e 14 dias ou mais sem chuva | −100 mm ou menos, 21 dias ou mais sem chuva e menos de 10 mm previstos | −130 mm ou menos, 30 dias ou mais sem chuva e menos de 5 mm previstos |

Para a cheia, o caudal do rio também conta: se a mediana do caudal dos últimos 30 dias for de pelo menos 5 m³/s e o máximo previsto for o dobro ou mais dessa mediana, o nível sobe um grau (até ao máximo). Para a seca, o balanço hídrico é a chuva menos a evaporação dos últimos 30 dias, e um dia sem chuva é um dia com menos de 1 mm. De Maio a Outubro, a época seca, o nível de seca desce um grau, porque chover pouco é normal nessa altura.

## Fontes de dados

| Fonte | Para quê | Licença |
|---|---|---|
| [Open-Meteo Forecast](https://open-meteo.com/en/docs) | Chuva, vento, rajadas e evapotranspiração | CC BY 4.0 |
| [Open-Meteo Flood](https://open-meteo.com/en/docs/flood-api) (GloFAS, Copernicus) | Caudal dos rios | CC BY 4.0 |
| [Open-Meteo Elevation](https://open-meteo.com/en/docs/elevation-api) (Copernicus DEM) | Altitude do utilizador e dos possíveis abrigos | CC BY 4.0 |
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) ([GeoNames](https://www.geonames.org)) | Pesquisa de localidades, filtrada por `countryCode=MZ` | CC BY 4.0 |
| [OpenStreetMap](https://www.openstreetmap.org), via [Overpass](https://overpass-api.de) | Edifícios públicos perto da localidade | ODbL |
| [GDACS](https://www.gdacs.org) (ONU e Comissão Europeia) | Ciclones, cheias e secas que afectam Moçambique | Dados públicos, com citação da fonte |
| `public/dados/centros-acomodacao.json` | Centros de acomodação usados em emergências anteriores | Citação das fontes de cada registo |
| `public/dados/capitais-provinciais.json` | Coordenadas das 11 capitais (GeoNames, recolhido a 21/11/2026) | CC BY 4.0 |

A API do GDACS não foi pensada para ser chamada directamente do browser. Por isso o script `scripts/actualizar-gdacs.mjs` descarrega os eventos de ciclones, cheias e secas do último ano e grava uma cópia leve em `public/dados/gdacs-mz.json`. O GitHub Actions corre-o antes de cada publicação e de 3 em 3 horas. Se o GDACS falhar nessa altura, a publicação segue com a última cópia.

## Porque existe um servidor

O GitHub Pages só serve ficheiros estáticos, e tudo o que lá está pode ser lido por qualquer pessoa. Uma chave da Twilio num ficheiro da aplicação ficaria exposta. Por isso o envio de SMS e os relatos da comunidade passam por funções serverless na Vercel, na pasta [`servidor/`](servidor/README.md). A aplicação só conhece o endereço público dessas funções (`VITE_API_URL`); as chaves ficam nas variáveis de ambiente da Vercel.

| Função | O que faz |
|---|---|
| `POST /api/sms` | Envia o alerta pela Twilio |
| `GET` e `POST /api/relatos` | Lista, cria, confirma e denuncia relatos; guarda-os 72 horas num Redis (Upstash) |
| `GET /api/estado` | Indica se o SMS e a comunidade estão configurados, sem mostrar chaves |

As funções têm as seguintes protecções:

- CORS limitado aos domínios da variável `ORIGENS_PERMITIDAS`.
- O SMS só aceita telemóveis de Moçambique e textos que começam por «Chuva Segura MZ» (até 320 caracteres), para a função não servir para enviar mensagens quaisquer.
- Limite de 5 envios por hora por pessoa e 3 por dia por número.
- A pessoa é identificada por um hash do IP com um texto secreto (`SAL_IP`), por isso o IP nunca é guardado em claro.
- Os relatos têm tamanho máximo por campo, recusam dados pessoais e limitam a 5 publicações por hora por pessoa.

## Limitações

- Os níveis de risco são uma orientação do grupo, calculada com previsões de modelos globais. Não substituem os avisos do INAM e do INGD, que a aplicação recomenda seguir.
- Os centros de acomodação são os que a imprensa e os relatórios das agências documentaram em emergências passadas. Os centros oficiais de cada emergência são definidos pelo INGD, e a lista pode não estar completa.
- Os edifícios em terreno alto dependem do que está mapeado no OpenStreetMap, que em zonas rurais pode estar incompleto.
- Os relatos da comunidade não são verificados. Há confirmações e denúncias, mas nenhuma moderação.
- Enquanto a conta Twilio for de teste, só envia SMS para números verificados no painel da Twilio.

## Correr o projecto localmente

Requisitos: Node.js 20.19 ou superior (recomendado: 22).

```bash
npm install
cp .env.example .env     # no PowerShell: Copy-Item .env.example .env
npm run dev
```

No ficheiro `.env`, `VITE_API_URL` deve ter o endereço do servidor na Vercel. Se ficar vazio, a aplicação funciona, mas sem envio de SMS e com os relatos guardados só no aparelho.

Outros comandos: `npm run build`, `npm run preview` e `npm run dados` (actualiza a cópia dos avisos do GDACS).

### Variáveis de ambiente

| Onde | Variável | Descrição |
|---|---|---|
| Aplicação (`.env` e GitHub → Settings → Actions → Variables) | `VITE_API_URL` | Endereço público do servidor |
| Vercel | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_NUMERO` | Conta e número da Twilio |
| Vercel | `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Redis da Upstash, criadas pela Vercel ao ligar a base de dados |
| Vercel | `ORIGENS_PERMITIDAS`, `SAL_IP` | Domínios autorizados e texto secreto para anonimizar o IP |

O ficheiro `.env` está no `.gitignore`. Os valores das chaves nunca entram no repositório; os ficheiros `.env.example` mostram só os nomes. O passo a passo para publicar o servidor (Twilio, Vercel e Upstash) está em [`servidor/README.md`](servidor/README.md).

## Publicação

A aplicação é publicada no GitHub Pages pelo workflow `.github/workflows/deploy.yml`, a cada alteração no `main`, manualmente e de 3 em 3 horas. Duas escolhas de configuração tornam isto possível:

- Em `vite.config.js`, `base` tem de ser igual ao nome do repositório (`'/Chuva_segura/'`). Sem isso, o navegador não encontra os ficheiros no GitHub Pages.
- O Vue Router usa `createWebHashHistory()`. As rotas ficam depois do `#`, por isso actualizar a página não dá erro 404 num alojamento estático.

## Estrutura do projecto

```
src/
  assets/main.css       estilos globais (mobile-first)
  components/           componentes reutilizáveis e ícones SVG animados
  composables/          lógica reutilizável (previsão, pesquisa, abrigos, relatos, SMS, localização)
  router/index.js       rotas
  services/             acesso a dados: http (cache e erros), openMeteo, gdacs, abrigos, centros,
                        comunidade, sms, servidor
  utils/                risco (cheia, vento, seca), tempo, geo
  views/                uma por página
servidor/               funções serverless da Vercel (api/sms.js, api/relatos.js, api/estado.js)
scripts/                actualizar-gdacs.mjs
public/dados/           capitais, centros de acomodação e cópia dos avisos do GDACS
```

## Equipa

| Nome | Parte | N.º de estudante | GitHub |
|---|---|---|---|
| Ivan Jaime Antonio | Configuração inicial, camada de dados e avaliação de riscos | | @ |
| Miracle Calege | Página inicial, avisos do GDACS e pesquisa | | @ |
| Télcio Calege | Página de riscos da localidade e comunidade | | @ |
| Régio Abibo | Abrigos, alerta por SMS e servidor | | @ |

## Tecnologias

[Vue 3](https://vuejs.org) com Composition API e `<script setup>`, [Vue Router](https://router.vuejs.org) e [Vite](https://vite.dev) na aplicação. No servidor, funções Node.js na [Vercel](https://vercel.com), [Twilio](https://www.twilio.com) para o SMS e [Upstash Redis](https://upstash.com) para os relatos. O projecto não usa mais nenhuma biblioteca.

## Uso de ferramentas de IA

Usámos o Claude, da Anthropic, incluindo o Claude Code, para propor estrutura e código dos componentes, composables, serviços e funções serverless, e para redigir este README. Cada membro é responsável pela parte que submeteu e deve conseguir explicá-la na defesa.
