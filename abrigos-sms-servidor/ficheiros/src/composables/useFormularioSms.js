import { reactive, computed } from 'vue'
import { normalizarTelefone } from '../services/sms'

const PADRAO_TELEMOVEL_MZ = /^\+2588[2-7]\d{7}$/

/** Campos e validação do formulário de alerta por SMS. */
export function useFormularioSms() {
  const campos = reactive({ telefone: '', confirmar: false })
  const tocados = reactive({ telefone: false, confirmar: false })

  const telefoneNormalizado = computed(() => normalizarTelefone(campos.telefone))

  const erros = computed(() => {
    const e = {}
    if (!campos.telefone.trim()) e.telefone = 'Indique o número de telemóvel.'
    else if (!PADRAO_TELEMOVEL_MZ.test(telefoneNormalizado.value))
      e.telefone = 'Use um telemóvel de Moçambique, por exemplo 84 123 4567.'
    if (!campos.confirmar) e.confirmar = 'Confirme que o número é seu.'
    return e
  })

  const valido = computed(() => Object.keys(erros.value).length === 0)
  const erroDe = (campo) => (tocados[campo] ? (erros.value[campo] ?? '') : '')
  const marcarTocado = (campo) => (tocados[campo] = true)
  const marcarTodos = () => Object.keys(tocados).forEach((c) => (tocados[c] = true))

  function limpar() {
    campos.telefone = ''
    campos.confirmar = false
    Object.keys(tocados).forEach((c) => (tocados[c] = false))
  }

  return { campos, erros, valido, telefoneNormalizado, erroDe, marcarTocado, marcarTodos, limpar }
}
