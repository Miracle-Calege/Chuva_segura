// /api/relatos — relatos da comunidade sobre vias fechadas, zonas alagadas e caminhos alternativos.
//   GET  /api/relatos?cidade=ID          → últimos relatos (72 h), de uma localidade ou de todas
//   POST /api/relatos                     → cria um relato
//   POST /api/relatos?accao=confirmar&id= → "ainda é verdade" (+1)
//   POST /api/relatos?accao=denunciar&id= → denúncia (3 denúncias escondem o relato)
//   POST /api/relatos?accao=retirar-denuncia&id= → anula a denúncia feita por engano
// Os relatos apagam-se sozinhos ao fim de 72 horas (as vias mudam depressa).
import { randomUUID } from 'node:crypto'
import { tratarCors, idCliente, lerCorpo, temDadosPessoais } from '../lib/http.js'
import { comando, varios, redisConfigurado, dentroDoLimite } from '../lib/redis.js'

const VALIDADE_S = 72 * 3600
const TIPOS = ['via-fechada', 'via-alternativa', 'zona-alagada', 'ponte-danificada', 'abrigo-aberto', 'outro']
const LIMITE_DENUNCIAS = 3

const chaveLista = (cidadeId) => (cidadeId ? `relatos:cidade:${cidadeId}` : 'relatos:todos')

function limpar(texto, maximo) {
  return String(texto ?? '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximo)
}

async function listar(cidadeId) {
  const chave = chaveLista(cidadeId)
  const agora = Date.now()
  await comando('ZREMRANGEBYSCORE', chave, '-inf', agora - VALIDADE_S * 1000)
  const ids = await comando('ZREVRANGE', chave, 0, 49)
  if (!ids?.length) return []
  const valores = await comando('MGET', ...ids.map((id) => `relato:${id}`))
  return valores
    .filter(Boolean)
    .map((v) => JSON.parse(v))
    .filter((r) => r.denuncias < LIMITE_DENUNCIAS)
}

async function criar(req, res) {
  const corpo = lerCorpo(req)
  const relato = {
    id: randomUUID(),
    cidadeId: limpar(corpo.cidadeId, 12),
    cidadeNome: limpar(corpo.cidadeNome, 60),
    tipo: TIPOS.includes(corpo.tipo) ? corpo.tipo : 'outro',
    local: limpar(corpo.local, 80),
    descricao: limpar(corpo.descricao, 280),
    alternativa: limpar(corpo.alternativa, 200),
    criadoEm: new Date().toISOString(),
    confirmacoes: 0,
    denuncias: 0,
  }
  if (!/^\d+$/.test(relato.cidadeId) || relato.local.length < 3 || relato.descricao.length < 10) {
    return res.status(400).json({ erro: 'Indique a localidade, o local (rua, ponte, bairro) e uma descrição com pelo menos 10 letras.' })
  }
  if ([relato.local, relato.descricao, relato.alternativa].some(temDadosPessoais)) {
    return res.status(400).json({ erro: 'Não escreva números de telefone, e-mails nem ligações nos relatos.' })
  }
  if (!(await dentroDoLimite(`relato:${idCliente(req)}`, 5, 3600))) {
    return res.status(429).json({ erro: 'Já publicou vários relatos na última hora. Tente mais tarde.' })
  }
  const pontuacao = Date.parse(relato.criadoEm)
  await varios([
    ['SET', `relato:${relato.id}`, JSON.stringify(relato), 'EX', VALIDADE_S],
    ['ZADD', chaveLista(relato.cidadeId), pontuacao, relato.id],
    ['ZADD', chaveLista(null), pontuacao, relato.id],
  ])
  return res.status(201).json({ relato })
}

async function retirarDenuncia(req, res, id) {
  if (!/^[0-9a-f-]{36}$/.test(id ?? '')) return res.status(400).json({ erro: 'Relato inválido.' })
  const removida = await comando('DEL', `reaccao:denunciar:${id}:${idCliente(req)}`)
  const texto = await comando('GET', `relato:${id}`)
  if (!texto) return res.status(404).json({ erro: 'Este relato já expirou.' })
  const relato = JSON.parse(texto)
  if (removida) {
    relato.denuncias = Math.max(0, relato.denuncias - 1)
    await comando('SET', `relato:${id}`, JSON.stringify(relato), 'KEEPTTL')
  }
  return res.status(200).json({ relato })
}

async function reagir(req, res, accao, id) {
  if (!/^[0-9a-f-]{36}$/.test(id ?? '')) return res.status(400).json({ erro: 'Relato inválido.' })
  // cada pessoa só confirma/denuncia uma vez cada relato
  const primeiraVez = await comando('SET', `reaccao:${accao}:${id}:${idCliente(req)}`, '1', 'NX', 'EX', VALIDADE_S)
  const texto = await comando('GET', `relato:${id}`)
  if (!texto) return res.status(404).json({ erro: 'Este relato já expirou.' })
  const relato = JSON.parse(texto)
  if (primeiraVez) {
    if (accao === 'confirmar') relato.confirmacoes += 1
    else relato.denuncias += 1
    await comando('SET', `relato:${id}`, JSON.stringify(relato), 'KEEPTTL')
  }
  return res.status(200).json({ relato, repetido: !primeiraVez })
}

export default async function handler(req, res) {
  if (!tratarCors(req, res)) return
  if (!redisConfigurado()) return res.status(503).json({ erro: 'A comunidade ainda não está configurada no servidor.' })

  try {
    if (req.method === 'GET') {
      const cidade = /^\d+$/.test(req.query.cidade ?? '') ? req.query.cidade : null
      res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=60')
      return res.status(200).json({ relatos: await listar(cidade) })
    }
    if (req.method === 'POST') {
      const { accao, id } = req.query
      if (accao === 'confirmar' || accao === 'denunciar') return reagir(req, res, accao, id)
      if (accao === 'retirar-denuncia') return retirarDenuncia(req, res, id)
      return criar(req, res)
    }
    return res.status(405).json({ erro: 'Método não suportado.' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ erro: 'Erro no servidor. Tente de novo.' })
  }
}
