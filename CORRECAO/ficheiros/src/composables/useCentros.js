import { ref, computed, toValue } from 'vue'
import { obterCentros } from '../services/centros'
import { distanciaKm } from '../utils/geo'

/**
 * Centros de acomodação documentados, filtrados pela província e ordenados pela distância.
 * @param provincia chave da província (ref/função)
 * @param origem { latitude, longitude } de onde a pessoa sai (ref/função, opcional)
 */
export function useCentros(provincia, origem) {
  const dados = ref(null)
  const aCarregar = ref(false)
  const erro = ref('')

  async function carregar() {
    aCarregar.value = true
    erro.value = ''
    try {
      dados.value = await obterCentros()
    } catch (e) {
      erro.value = e.message
    } finally {
      aCarregar.value = false
    }
  }

  const comDistancia = computed(() => {
    const o = toValue(origem)
    return (dados.value?.centros ?? []).map((c) => ({ ...c, distanciaKm: o ? distanciaKm(o, c) : null }))
  })

  // Os da província escolhida; se não houver nenhum, os 3 mais próximos do país.
  const lista = computed(() => {
    const p = toValue(provincia)
    const daProvincia = comDistancia.value.filter((c) => !p || c.provincia === p)
    const ordenar = (a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0)
    if (!p) return daProvincia.sort(ordenar).slice(0, toValue(origem) ? 8 : daProvincia.length)
    if (daProvincia.length || !toValue(origem)) return daProvincia.sort(ordenar)
    return [...comDistancia.value].sort(ordenar).slice(0, 3)
  })

  const foraDaProvincia = computed(() => {
    const p = toValue(provincia)
    return Boolean(p) && lista.value.length > 0 && lista.value.every((c) => c.provincia !== p)
  })

  const nota = computed(() => dados.value?.notasProvincia?.[toValue(provincia)] ?? '')

  carregar()
  return { lista, foraDaProvincia, nota, aCarregar, erro, recarregar: carregar }
}
