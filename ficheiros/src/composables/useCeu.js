import { ref, readonly } from 'vue'
import { eDiaEmMocambique } from '../utils/tempo'

// Céu de fundo partilhado por toda a aplicação (estado global simples, sem bibliotecas).
// Valores: 'limpo' | 'nublado' | 'chuva' | 'trovoada' | 'noite'
const ceu = ref(eDiaEmMocambique() ? 'limpo' : 'noite')

export function useCeu() {
  function definirCeu(novo) {
    ceu.value = novo
  }
  function repor() {
    ceu.value = eDiaEmMocambique() ? 'limpo' : 'noite'
  }
  return { ceu: readonly(ceu), definirCeu, repor }
}
