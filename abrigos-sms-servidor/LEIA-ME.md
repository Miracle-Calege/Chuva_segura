# Régio — branch `regio/abrigos-sms-servidor`

«Onde me abrigar» (centros de acomodação documentados + edifícios em terreno alto), alerta por **SMS** (requisito R3) e o **servidor** (funções serverless na Vercel, para não expor chaves).
**Só começar depois de o PR do Ivan estar no `main`.**

## 1. Publicar o servidor e a Twilio (fazer JÁ — o SMS tem de chegar na demonstração)
Seguir `ficheiros/servidor/README.md`: conta Twilio (verificar os telemóveis do grupo; activar Moçambique em *Geo permissions*) → `npx vercel login` e `npx vercel deploy --prod` na pasta `servidor` → variáveis no site da Vercel → `…/api/estado` mostra `"sms":true`.
Passar o endereço do servidor ao Ivan (para a variável `VITE_API_URL` do GitHub) e pô-lo no vosso `.env` local.
**As chaves da Twilio só no site da Vercel. Nunca num ficheiro do repositório nem no chat do grupo.**

## 2. Comandos
```bash
git clone https://github.com/<utilizador-do-ivan>/pwebii-2026-grupo5-chuva-segura.git   # só na 1.ª vez
cd pwebii-2026-grupo5-chuva-segura
git switch main && git pull
git switch -c regio/abrigos-sms-servidor
npm install
```
Copiar o conteúdo de `ficheiros/` (`AbrigosView.vue` e `SmsView.vue` **substituem** as provisórias). Depois, **5 commits**:
```bash
git add src/utils/geo.js public/dados/centros-acomodacao.json src/services/centros.js src/services/abrigos.js
git commit -m "Adiciona centros de acomodação documentados e procura de abrigos em terreno alto"

git add src/composables/useLocalizacao.js src/composables/useCentros.js src/composables/useAbrigos.js
git commit -m "Adiciona composables de localização, centros e abrigos"

git add src/components/CartaoCentro.vue src/components/CartaoAbrigo.vue src/views/AbrigosView.vue
git commit -m "Implementa a página Onde me abrigar"

git add servidor/
git commit -m "Adiciona funções serverless de SMS e relatos para a Vercel"

git add src/services/sms.js src/composables/useFormularioSms.js src/components/FormularioSms.vue src/views/SmsView.vue
git commit -m "Implementa o alerta por SMS com validação do número"

git status                                # .env e servidor/.vercel NÃO podem aparecer
git log --format='%an <%ae>' | sort -u
git push -u origin regio/abrigos-sms-servidor
```

## Pull request
**Título:** Abrigos, alerta por SMS e servidor serverless · **Revisor:** Ivan
```
O que foi feito
- 22 centros de acomodação usados em cheias e ciclones (2013–2026), com evento e fonte, em public/dados/centros-acomodacao.json; filtrados pela província e ordenados pela distância.
- Edifícios públicos em terreno alto perto do utilizador (OpenStreetMap/Overpass + altitude Open-Meteo); localização do telemóvel só quando o utilizador carrega no botão.
- SMS: formulário com validação (+258 82–87), mensagem curta (1 SMS), envio pela função serverless /api/sms (Twilio) e botão para enviar o mesmo texto pela app de SMS.
- servidor/: /api/sms, /api/relatos e /api/estado; chaves só em variáveis de ambiente da Vercel; CORS limitado; limites de envio.
Como testar: Onde me abrigar → escolher Gaza; numa cidade → Alerta por SMS → enviar para o próprio número.
```

## Explicar na defesa
- **Porque um servidor:** o GitHub Pages só tem ficheiros públicos; a chave da Twilio é secreta, por isso fica numa função da Vercel e a app só chama essa função.
- **Protecções:** só telemóveis de Moçambique, só textos que começam por «Chuva Segura MZ», 5 envios/hora por pessoa e 3/dia por número, IP guardado só como *hash*.
- **Centros documentados:** recolhidos de notícias e relatórios (AIM, Lusa, OMS, UNICEF, OCHA); os oficiais são definidos pelo INGD em cada emergência — a app diz isso.
