// Pedidos à nossa função serverless (Vercel): SMS e relatos da comunidade.
// O endereço vem da variável VITE_API_URL (não é segredo: as chaves ficam no servidor).
import { ErroPedido } from './http'

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export function servidorConfigurado() {
  return Boolean(BASE)
}

export async function pedirServidor(caminho, { metodo = 'GET', corpo, tempoLimiteMs = 20000 } = {}) {
  if (!BASE) throw new ErroPedido('O servidor da aplicação não está configurado (VITE_API_URL).', 'configuracao')
  if (navigator.onLine === false) {
    throw new ErroPedido('Está sem ligação à Internet. Ligue os dados móveis ou o Wi-Fi e tente de novo.', 'sem-ligacao')
  }
  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), tempoLimiteMs)
  let resposta
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      method: metodo,
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: controlador.signal,
    })
  } catch (e) {
    throw new ErroPedido(
      e.name === 'AbortError' ? 'O servidor demorou demasiado a responder.' : 'Não foi possível contactar o servidor.',
      'rede',
    )
  } finally {
    clearTimeout(temporizador)
  }
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) throw new ErroPedido(dados.erro ?? `Erro do servidor (${resposta.status}).`, 'servidor')
  return dados
}
