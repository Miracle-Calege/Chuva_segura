// POST /api/sms — envia um alerta por SMS através da Twilio.
// Corpo: { telefone: "+25884xxxxxxx", texto: "Chuva Segura MZ: ..." }
// As credenciais da Twilio ficam só nas variáveis de ambiente da Vercel.
import { tratarCors, idCliente, lerCorpo } from '../lib/http.js'
import { dentroDoLimite } from '../lib/redis.js'

// Telemóveis de Moçambique: +258 82/83/84/85/86/87 + 7 dígitos
const PADRAO_TELEFONE = /^\+258(8[2-7])\d{7}$/
const PREFIXO_OBRIGATORIO = 'Chuva Segura MZ'

const ERROS_TWILIO = {
  21608: 'Na conta de teste da Twilio só se pode enviar para números verificados. Verifique este número no painel da Twilio.',
  21211: 'O número de telefone não é válido.',
  21408: 'A conta Twilio não tem permissão para enviar SMS para Moçambique (Messaging → Geo permissions).',
  21610: 'Este número pediu para não receber mensagens.',
}

export default async function handler(req, res) {
  if (!tratarCors(req, res, 'POST, OPTIONS')) return
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Use POST.' })

  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_NUMERO: numero } = process.env
  if (!sid || !token || !numero) return res.status(503).json({ erro: 'O envio de SMS não está configurado no servidor.' })

  const { telefone, texto } = lerCorpo(req)
  const telefoneLimpo = String(telefone ?? '').replace(/[\s-]/g, '')
  if (!PADRAO_TELEFONE.test(telefoneLimpo)) {
    return res.status(400).json({ erro: 'Número inválido. Use um telemóvel de Moçambique (+258 8X XXX XXXX).' })
  }
  // Só aceitamos alertas gerados pela aplicação (evita usar a função para enviar SMS quaisquer).
  if (typeof texto !== 'string' || !texto.startsWith(PREFIXO_OBRIGATORIO) || texto.length > 320) {
    return res.status(400).json({ erro: 'Mensagem inválida.' })
  }

  const cliente = idCliente(req)
  if (!(await dentroDoLimite(`sms-ip:${cliente}`, 5, 3600)) || !(await dentroDoLimite(`sms-tel:${telefoneLimpo}`, 3, 86400))) {
    return res.status(429).json({ erro: 'Limite de envios atingido. Tente mais tarde.' })
  }

  const resposta = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: telefoneLimpo, From: numero, Body: texto }),
  })
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) {
    return res.status(502).json({ erro: ERROS_TWILIO[dados.code] ?? `A Twilio recusou o envio (${dados.code ?? resposta.status}).` })
  }
  return res.status(200).json({ ok: true, estado: dados.status })
}
