import { ref, computed } from 'vue'
import { obterCapitais } from '../services/dadosLocais'
import { obterPrevisaoVarias } from '../services/openMeteo'
import { avaliarRiscos } from '../utils/risco'

/**
 * Capitais provinciais com o risco de cheia, ciclone/vento e seca (próximos 3 dias).
 * Todas as previsões são pedidas num só pedido, para gastar menos dados.
 */
export function useCapitais() {
  const capitais = ref([])
  const aCarregar = ref(false)
  const erro = ref('')
  const erroPrevisao = ref('')

  // Primeiro as de maior risco; em empate, as de mais chuva.
  const ordenadas = computed(() =>
    [...capitais.value].sort(
      (a, b) => (b.risco?.nivel ?? -1) - (a.risco?.nivel ?? -1) || (b.risco?.cheia.totalChuva ?? 0) - (a.risco?.cheia.totalChuva ?? 0),
    ),
  )

  async function carregar() {
    aCarregar.value = true
    erro.value = ''
    erroPrevisao.value = ''
    try {
      const lista = await obterCapitais()
      capitais.value = lista.map((c) => ({ ...c, risco: null, actual: null }))
      try {
        const previsoes = await obterPrevisaoVarias(lista, 3)
        capitais.value = lista.map((c, i) => ({
          ...c,
          actual: previsoes[i]?.actual ?? null,
          risco: previsoes[i] ? avaliarRiscos(previsoes[i]) : null,
        }))
      } catch (e) {
        erroPrevisao.value = e.message
      }
    } catch (e) {
      erro.value = e.message
    } finally {
      aCarregar.value = false
    }
  }

  carregar()

  return { capitais, ordenadas, aCarregar, erro, erroPrevisao, recarregar: carregar }
}
