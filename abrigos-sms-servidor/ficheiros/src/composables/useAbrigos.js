import { ref, computed } from 'vue'
import { procurarAbrigos } from '../services/abrigos'

/** Possíveis abrigos em terreno alto, a partir do centro da localidade ou da posição do utilizador. */
export function useAbrigos() {
  const locais = ref([])
  const altitudeOrigem = ref(null)
  const aCarregar = ref(false)
  const erro = ref('')
  let numeroDoPedido = 0

  // Os que não ficam mais baixos do que o ponto de partida (mais altos primeiro, pela pontuação)
  const maisAltos = computed(() => locais.value.filter((l) => l.desnivel === null || l.desnivel >= -2).slice(0, 10))

  async function carregar(centro, origem) {
    const esteNumero = ++numeroDoPedido
    aCarregar.value = true
    erro.value = ''
    try {
      const resultado = await procurarAbrigos(centro, origem)
      if (esteNumero !== numeroDoPedido) return
      locais.value = resultado.locais
      altitudeOrigem.value = resultado.altitudeOrigem
    } catch (e) {
      if (esteNumero !== numeroDoPedido) return
      locais.value = []
      erro.value = e.message
    } finally {
      if (esteNumero === numeroDoPedido) aCarregar.value = false
    }
  }

  return { locais, maisAltos, altitudeOrigem, aCarregar, erro, carregar }
}
