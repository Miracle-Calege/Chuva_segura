import { ref } from 'vue'
import { procurarCidades } from '../services/openMeteo'

/** Pesquisa de localidades de Moçambique, com estados de carregamento, erro e lista vazia. */
export function usePesquisaCidades() {
  const resultados = ref([])
  const aCarregar = ref(false)
  const erro = ref('')
  const termoPesquisado = ref('')
  let numeroDoPedido = 0 // ignora respostas de pesquisas antigas que cheguem atrasadas

  async function pesquisar(termo) {
    const limpo = (termo ?? '').trim()
    if (limpo.length < 2) {
      numeroDoPedido++
      resultados.value = []
      termoPesquisado.value = ''
      erro.value = ''
      aCarregar.value = false
      return
    }

    const esteNumero = ++numeroDoPedido
    aCarregar.value = true
    erro.value = ''
    try {
      const lista = await procurarCidades(limpo)
      if (esteNumero !== numeroDoPedido) return
      resultados.value = lista
      termoPesquisado.value = limpo
    } catch (e) {
      if (esteNumero !== numeroDoPedido) return
      resultados.value = []
      erro.value = e.message
    } finally {
      if (esteNumero === numeroDoPedido) aCarregar.value = false
    }
  }

  return { resultados, aCarregar, erro, termoPesquisado, pesquisar }
}
