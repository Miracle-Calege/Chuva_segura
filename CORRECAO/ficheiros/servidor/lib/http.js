// Utilitários HTTP comuns às funções: CORS, IP do cliente e respostas de erro.
import { createHash } from 'node:crypto'

const origens = () =>
  (process.env.ORIGENS_PERMITIDAS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

/** Aplica CORS. Devolve false (e responde) quando a origem não é permitida ou o pedido é OPTIONS. */
export function tratarCors(req, res, metodos = 'GET, POST, OPTIONS') {
  const origem = req.headers.origin
  const permitidas = origens()
  if (origem && permitidas.length > 0 && !permitidas.includes(origem)) {
    res.status(403).json({ erro: 'Origem não autorizada.' })
    return false
  }
  if (origem) res.setHeader('Access-Control-Allow-Origin', origem)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', metodos)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return false
  }
  return true
}

/** Identificador anónimo do cliente (hash do IP com "sal"), para limitar abusos sem guardar o IP. */
export function idCliente(req) {
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'desconhecido')
    .split(',')[0]
    .trim()
  return createHash('sha256')
    .update(`${process.env.SAL_IP ?? 'chuva-segura'}:${ip}`)
    .digest('hex')
    .slice(0, 16)
}

export function lerCorpo(req) {
  if (req.body && typeof req.body === 'object') return req.body
  try {
    return JSON.parse(req.body ?? '{}')
  } catch {
    return {}
  }
}

/** Recusa textos com números de telefone, e-mails ou ligações (dados pessoais / spam). */
export function temDadosPessoais(texto) {
  return /(\+?\d[\d\s-]{7,}\d)|([^\s@]+@[^\s@]+\.[^\s@]+)|(https?:\/\/|www\.)/i.test(texto)
}
