import { ref, computed, watch, toValue } from 'vue'
import { obterCidade, obterPrevisao, obterCaudal } from '../services/openMeteo'
import { avaliarRiscos } from '../utils/risco'

/**
 * Carrega a localidade, o tempo actual, os últimos 30 dias, a previsão de 7 dias e o caudal
 * do rio mais próximo, e avalia os riscos de cheia, ciclone/vento e seca.
 * @param id identificador do GeoNames (valor, ref ou função)
 */
export function usePrevisaoCidade(id) {
  const cidade = ref(null)
  const dados = ref(null) // { actual, passado, previsao }
  const caudal = ref(null)
  const aCarregar = ref(false)
  const erro = ref('')
  const avisoCaudal = ref('')
  let numeroDoPedido = 0

  const actual = computed(() => dados.value?.actual ?? null)
  const riscos = computed(() => avaliarRiscos(dados.value, caudal.value))

  async function carregar() {
    const idActual = toValue(id)
    if (!idActual) return
    const esteNumero = ++numeroDoPedido
    aCarregar.value = true
    erro.value = ''
    avisoCaudal.value = ''

    try {
      const local = await obterCidade(idActual)
      // Previsão e caudal em paralelo; a falta do caudal não impede o uso da aplicação.
      const [previsao, rio] = await Promise.allSettled([obterPrevisao(local), obterCaudal(local)])
      if (esteNumero !== numeroDoPedido) return
      if (previsao.status === 'rejected') throw previsao.reason

      cidade.value = local
      dados.value = previsao.value
      if (rio.status === 'fulfilled') {
        caudal.value = rio.value
        if (!rio.value) avisoCaudal.value = 'Não há um rio modelado perto desta localidade.'
      } else {
        caudal.value = null
        avisoCaudal.value = 'Não foi possível obter agora o caudal dos rios.'
      }
    } catch (e) {
      if (esteNumero !== numeroDoPedido) return
      dados.value = null
      caudal.value = null
      erro.value = e.message
    } finally {
      if (esteNumero === numeroDoPedido) aCarregar.value = false
    }
  }

  watch(() => toValue(id), carregar, { immediate: true })

  return { cidade, actual, dados, caudal, riscos, aCarregar, erro, avisoCaudal, recarregar: carregar }
}
