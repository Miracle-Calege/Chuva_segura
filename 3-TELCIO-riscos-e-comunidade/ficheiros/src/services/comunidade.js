// Relatos da comunidade sobre vias fechadas, zonas alagadas e caminhos alternativos.
import { pedirServidor, servidorConfigurado } from './servidor'

export const TIPOS_RELATO = [
  { id: 'via-fechada', nome: 'Via fechada', icone: '⛔' },
  { id: 'via-alternativa', nome: 'Caminho alternativo', icone: '↪️' },
  { id: 'zona-alagada', nome: 'Zona alagada', icone: '🌊' },
  { id: 'ponte-danificada', nome: 'Ponte danificada', icone: '🌉' },
  { id: 'abrigo-aberto', nome: 'Abrigo aberto', icone: '🏫' },
  { id: 'outro', nome: 'Outro', icone: '📍' },
]

export function infoTipoRelato(id) {
  return TIPOS_RELATO.find((t) => t.id === id) ?? TIPOS_RELATO[TIPOS_RELATO.length - 1]
}

// ---- Modo local (sem servidor) ----
// Enquanto o servidor não está ligado, os relatos ficam guardados só neste aparelho (localStorage),
// para que a página funcione e possa ser testada. Com o servidor, são partilhados com todos.
export const modoLocal = () => !servidorConfigurado()

const CHAVE_LOCAL = 'chuva-segura:relatos-local'
const VALIDADE_MS = 72 * 60 * 60 * 1000

function lerLocais() {
  try {
    const todos = JSON.parse(localStorage.getItem(CHAVE_LOCAL) ?? '[]')
    return todos.filter((r) => Date.now() - Date.parse(r.criadoEm) < VALIDADE_MS)
  } catch {
    return []
  }
}

function gravarLocais(relatos) {
  try {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify(relatos))
  } catch {
    /* sem espaço ou sem localStorage */
  }
}

function novoId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// ---- API ----

export async function listarRelatos(cidadeId) {
  if (modoLocal()) {
    return lerLocais()
      .filter((r) => !cidadeId || String(r.cidadeId) === String(cidadeId))
      .filter((r) => r.denuncias < 3)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
  }
  const dados = await pedirServidor(`/api/relatos${cidadeId ? `?cidade=${cidadeId}` : ''}`)
  return dados.relatos ?? []
}

export async function criarRelato(relato) {
  if (modoLocal()) {
    const novo = {
      ...relato,
      cidadeId: String(relato.cidadeId),
      id: novoId(),
      criadoEm: new Date().toISOString(),
      confirmacoes: 0,
      denuncias: 0,
    }
    gravarLocais([novo, ...lerLocais()])
    return novo
  }
  const dados = await pedirServidor('/api/relatos', { metodo: 'POST', corpo: relato })
  return dados.relato
}

export async function reagirRelato(id, accao) {
  if (modoLocal()) {
    const todos = lerLocais()
    const relato = todos.find((r) => r.id === id)
    if (!relato) throw new Error('Este relato já expirou.')
    if (accao === 'confirmar') relato.confirmacoes += 1
    else if (accao === 'denunciar') relato.denuncias += 1
    else if (accao === 'retirar-denuncia') relato.denuncias = Math.max(0, relato.denuncias - 1)
    gravarLocais(todos)
    return { relato }
  }
  return pedirServidor(`/api/relatos?accao=${accao}&id=${encodeURIComponent(id)}`, { metodo: 'POST' })
}

/** "há 5 min", "há 3 h", "há 2 dias" */
export function haQuantoTempo(iso) {
  const minutos = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000))
  if (minutos < 1) return 'agora mesmo'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.round(horas / 24)
  return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`
}
