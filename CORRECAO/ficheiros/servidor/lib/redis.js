// Acesso ao Redis da Upstash pela API REST (sem bibliotecas).
// A integração "Upstash for Redis" da Vercel cria KV_REST_API_URL e KV_REST_API_TOKEN.

const url = () => process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const token = () => process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

export function redisConfigurado() {
  return Boolean(url() && token())
}

/** Executa um comando, por exemplo comando('SET', 'chave', 'valor', 'EX', 60). */
export async function comando(...partes) {
  const resposta = await fetch(url(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(partes.map(String)),
  })
  const dados = await resposta.json()
  if (!resposta.ok || dados.error) throw new Error(`Redis: ${dados.error ?? resposta.status}`)
  return dados.result
}

/** Executa vários comandos de uma vez. */
export async function varios(comandos) {
  const resposta = await fetch(`${url()}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(comandos.map((c) => c.map(String))),
  })
  const dados = await resposta.json()
  if (!resposta.ok) throw new Error(`Redis: ${resposta.status}`)
  return dados.map((d) => d.result)
}

/**
 * Limite de pedidos: devolve true se ainda pode, false se passou o limite.
 * Sem Redis configurado, não limita.
 */
export async function dentroDoLimite(chave, maximo, segundos) {
  if (!redisConfigurado()) return true
  const [total] = await varios([
    ['INCR', `limite:${chave}`],
    ['EXPIRE', `limite:${chave}`, segundos, 'NX'],
  ])
  return total <= maximo
}
