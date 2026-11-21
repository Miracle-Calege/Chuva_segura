import { ref, computed } from 'vue'
import { obterAvisosGdacs } from '../services/gdacs'

/** Eventos de ciclones, cheias e secas do GDACS que afectam Moçambique. */
export function useAvisosGdacs() {
  const eventos = ref([])
  const actualizadoEm = ref('')
  const aCarregar = ref(false)
  const erro = ref('')

  const activos = computed(() => eventos.value.filter((e) => e.actual))
  const recentes = computed(() => eventos.value.filter((e) => !e.actual).slice(0, 4))

  async function carregar() {
    aCarregar.value = true
    erro.value = ''
    try {
      const dados = await obterAvisosGdacs()
      eventos.value = dados.eventos
      actualizadoEm.value = dados.actualizadoEm
    } catch (e) {
      erro.value = e.message
    } finally {
      aCarregar.value = false
    }
  }

  carregar()
  return { eventos, activos, recentes, actualizadoEm, aCarregar, erro, recarregar: carregar }
}
