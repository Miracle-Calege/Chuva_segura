import { ref, watch, toValue } from 'vue'
import { listarRelatos, criarRelato, reagirRelato, modoLocal } from '../services/comunidade'

// As reacções desta pessoa ("confirmar:id", "denunciar:id") ficam guardadas no aparelho,
// para não confirmar duas vezes e para poder anular uma denúncia mesmo depois de recarregar.
const CHAVE_REACCOES = 'chuva-segura:reaccoes'
function lerReaccoes() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CHAVE_REACCOES) ?? '[]'))
  } catch {
    return new Set()
  }
}
function gravarReaccoes(conjunto) {
  try {
    localStorage.setItem(CHAVE_REACCOES, JSON.stringify([...conjunto].slice(-300)))
  } catch {
    /* sem localStorage */
  }
}

/** Lista de relatos da comunidade (de uma localidade ou de todo o país) e acções sobre eles. */
export function useRelatos(cidadeId) {
  const relatos = ref([])
  const aCarregar = ref(false)
  const erro = ref('')
  const local = modoLocal() // true enquanto o servidor não está ligado
  const reagidos = ref(lerReaccoes())

  async function carregar() {
    aCarregar.value = true
    erro.value = ''
    try {
      relatos.value = await listarRelatos(toValue(cidadeId))
    } catch (e) {
      erro.value = e.message
    } finally {
      aCarregar.value = false
    }
  }

  async function publicar(dados) {
    const novo = await criarRelato(dados)
    relatos.value = [novo, ...relatos.value]
    return novo
  }

  function marcar(chave, ligado) {
    const novo = new Set(reagidos.value)
    if (ligado) novo.add(chave)
    else novo.delete(chave)
    reagidos.value = novo
    gravarReaccoes(novo)
  }

  /** accao: 'confirmar' | 'denunciar' | 'retirar-denuncia' */
  async function reagir(id, accao) {
    if (accao === 'confirmar' && reagidos.value.has(`confirmar:${id}`)) return
    if (accao === 'denunciar' && reagidos.value.has(`denunciar:${id}`)) return
    const anterior = new Set(reagidos.value)
    if (accao === 'retirar-denuncia') marcar(`denunciar:${id}`, false)
    else marcar(`${accao}:${id}`, true)
    try {
      const { relato } = await reagirRelato(id, accao)
      // o relato continua visível para quem denunciou, para poder anular a denúncia
      relatos.value = relatos.value.map((r) => (r.id === id ? relato : r))
    } catch (e) {
      reagidos.value = anterior
      gravarReaccoes(anterior)
      erro.value = e.message
    }
  }

  watch(() => toValue(cidadeId), carregar, { immediate: true })

  return { relatos, aCarregar, erro, local, reagidos, carregar, publicar, reagir }
}
