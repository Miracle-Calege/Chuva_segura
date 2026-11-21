// Pedidos HTTP com cache e tratamento de erros.
// - Cache em memória e no localStorage, com prazo de validade: evita repetir pedidos
//   (os dados móveis são caros em Moçambique).
// - Junta pedidos iguais feitos ao mesmo tempo num só.
// - Tempo limite, para não deixar o utilizador à espera numa ligação instável.

export const DURACAO = {
  MINUTO: 60 * 1000,
  HORA: 60 * 60 * 1000,
  DIA: 24 * 60 * 60 * 1000,
}

const PREFIXO = 'chuva-segura:'
const memoria = new Map()
const pendentes = new Map()

export class ErroPedido extends Error {
  constructor(mensagem, tipo = 'desconhecido') {
    super(mensagem)
    this.name = 'ErroPedido'
    this.tipo = tipo
  }
}

function lerCache(chave, validadeMs) {
  const agora = Date.now()
  const emMemoria = memoria.get(chave)
  if (emMemoria && agora - emMemoria.guardadoEm < validadeMs) return emMemoria.dados

  try {
    const texto = localStorage.getItem(PREFIXO + chave)
    if (!texto) return undefined
    const registo = JSON.parse(texto)
    if (agora - registo.guardadoEm < validadeMs) {
      memoria.set(chave, registo)
      return registo.dados
    }
    localStorage.removeItem(PREFIXO + chave)
  } catch {
    // localStorage indisponível (modo privado) ou registo corrompido: ignora a cache
  }
  return undefined
}

function gravarCache(chave, dados) {
  const registo = { guardadoEm: Date.now(), dados }
  memoria.set(chave, registo)
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(registo))
  } catch {
    // Espaço cheio: apaga a cache antiga desta aplicação e continua só com a memória
    limparCache({ soLocalStorage: true })
  }
}

export function limparCache({ soLocalStorage = false } = {}) {
  if (!soLocalStorage) memoria.clear()
  try {
    Object.keys(localStorage)
      .filter((chave) => chave.startsWith(PREFIXO))
      .forEach((chave) => localStorage.removeItem(chave))
  } catch {
    /* sem localStorage */
  }
}

async function pedir(url, tempoLimiteMs) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ErroPedido(
      'Está sem ligação à Internet. Verifique os dados móveis ou o Wi-Fi e tente novamente.',
      'sem-ligacao',
    )
  }

  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), tempoLimiteMs)
  let resposta
  try {
    resposta = await fetch(url, { signal: controlador.signal })
  } catch (erro) {
    if (erro.name === 'AbortError') {
      throw new ErroPedido('O serviço demorou demasiado a responder. Tente novamente.', 'tempo-esgotado')
    }
    throw new ErroPedido(
      'Não foi possível contactar o serviço de dados. Verifique a ligação e tente novamente.',
      'rede',
    )
  } finally {
    clearTimeout(temporizador)
  }

  let dados = null
  try {
    dados = await resposta.json()
  } catch {
    /* o corpo da resposta não é JSON */
  }

  if (!resposta.ok || dados?.error) {
    const motivo = dados?.reason ? ` Motivo: ${dados.reason}` : ''
    throw new ErroPedido(`O serviço de dados respondeu com erro (${resposta.status}).${motivo}`, 'servidor')
  }
  if (dados === null) {
    throw new ErroPedido('A resposta do serviço de dados não tem o formato esperado.', 'formato')
  }
  return dados
}

/**
 * Faz um pedido GET e devolve o JSON.
 * @param {string} url
 * @param {{ validadeMs?: number, tempoLimiteMs?: number }} opcoes
 *   validadeMs: quanto tempo a resposta fica guardada em cache (0 = sem cache)
 */
export async function obterJSON(url, { validadeMs = 0, tempoLimiteMs = 15000 } = {}) {
  if (validadeMs > 0) {
    const guardado = lerCache(url, validadeMs)
    if (guardado !== undefined) return guardado
  }
  if (pendentes.has(url)) return pendentes.get(url)

  const promessa = pedir(url, tempoLimiteMs)
    .then((dados) => {
      if (validadeMs > 0) gravarCache(url, dados)
      return dados
    })
    .finally(() => pendentes.delete(url))

  pendentes.set(url, promessa)
  return promessa
}
