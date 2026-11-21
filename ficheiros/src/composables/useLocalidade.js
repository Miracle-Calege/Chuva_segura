import { ref, watch, toValue } from 'vue'
import { obterCidade } from '../services/openMeteo'

/** Carrega só os dados de uma localidade (nome, província, coordenadas, altitude). */
export function useLocalidade(id) {
  const cidade = ref(null)
  const aCarregar = ref(false)
  const erro = ref('')

  async function carregar() {
    const idActual = toValue(id)
    cidade.value = null
    erro.value = ''
    if (!idActual) return
    aCarregar.value = true
    try {
      cidade.value = await obterCidade(idActual)
    } catch (e) {
      erro.value = e.message
    } finally {
      aCarregar.value = false
    }
  }

  watch(() => toValue(id), carregar, { immediate: true })
  return { cidade, aCarregar, erro, recarregar: carregar }
}
