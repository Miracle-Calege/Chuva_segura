# Servidor da Chuva Segura MZ (funções serverless na Vercel)

A aplicação Vue é publicada no GitHub Pages, onde só há ficheiros estáticos e qualquer chave
fica visível. Por isso, o envio de SMS e os relatos da comunidade passam por estas duas funções,
que guardam as chaves como variáveis de ambiente da Vercel:

| Função | O que faz |
|---|---|
| `POST /api/sms` | Envia o alerta por SMS através da Twilio. Só aceita telemóveis de Moçambique e textos gerados pela aplicação; limita 5 envios/hora por pessoa e 3/dia por número. |
| `GET /api/estado` | Diz se o SMS e a comunidade estão configurados (sem mostrar chaves). Útil para verificar a publicação. |
| `GET/POST /api/relatos` | Lista, cria, confirma e denuncia relatos de vias fechadas e caminhos alternativos. Guarda-os 72 horas num Redis (Upstash). Recusa telefones, e-mails e ligações. |

## Publicar (cerca de 15 minutos)

### 1. Twilio (SMS)
1. Criar conta grátis em https://www.twilio.com/try-twilio (confirmar e-mail e telemóvel).
2. No *Console*, copiar o **Account SID** e o **Auth Token**.
3. Carregar em **Get a phone number** (número de teste grátis) e copiar o número (ex.: +1 555 123 4567).
4. *Phone Numbers → Manage → Verified Caller IDs*: verificar o telemóvel de cada membro do grupo
   (a conta de teste só envia para números verificados).
5. *Messaging → Settings → Geo permissions*: activar **Mozambique** e guardar.

### 2. Publicar a função na Vercel (no PowerShell, dentro da pasta `servidor`)
```powershell
cd servidor
npx vercel login          # abre o browser para entrar na conta da Vercel
npx vercel deploy --prod  # responder: Set up and deploy? Y · projeto novo · nome: chuva-segura-servidor
```
No fim aparece o endereço, por exemplo `https://chuva-segura-servidor.vercel.app`.

### 3. Variáveis (no site da Vercel → projecto → Settings → Environment Variables)
| Nome | Valor |
|---|---|
| `TWILIO_ACCOUNT_SID` | o Account SID |
| `TWILIO_AUTH_TOKEN` | o Auth Token |
| `TWILIO_NUMERO` | o número da Twilio, com + e sem espaços (ex.: `+15551234567`) |
| `ORIGENS_PERMITIDAS` | `http://localhost:5173,https://UTILIZADOR.github.io` |
| `SAL_IP` | um texto aleatório qualquer |

Para a comunidade partilhada: no projecto, *Storage → Create Database → Upstash for Redis → Free → Connect*
(cria `KV_REST_API_URL` e `KV_REST_API_TOKEN` sozinho).

Depois: `npx vercel deploy --prod` outra vez (para as variáveis entrarem em vigor).

### 4. Verificar
Abrir `https://chuva-segura-servidor.vercel.app/api/estado` no browser. Deve mostrar
`{"sms":true,"comunidade":true}`.

### 5. Ligar a aplicação
- No ficheiro `.env` da aplicação (na pasta principal): `VITE_API_URL=https://chuva-segura-servidor.vercel.app`
  e reiniciar o `npm run dev`.
- No GitHub: *Settings → Secrets and variables → Actions → Variables → New repository variable*
  `VITE_API_URL` com o mesmo endereço.

Nunca façam commit de valores destas variáveis. O ficheiro `.env.example` mostra só os nomes.
