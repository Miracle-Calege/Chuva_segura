import { reactive, computed } from 'vue'

const DADOS_PESSOAIS = /(\+?\d[\d\s-]{7,}\d)|([^\s@]+@[^\s@]+\.[^\s@]+)|(https?:\/\/|www\.)/i

/** Campos e validação do formulário de relato da comunidade. */
export function useFormularioRelato() {
  const campos = reactive({ tipo: 'via-fechada', local: '', descricao: '', alternativa: '' })
  const tocados = reactive({ local: false, descricao: false, alternativa: false })

  const erros = computed(() => {
    const e = {}
    if (campos.local.trim().length < 3) e.local = 'Indique a rua, ponte ou bairro.'
    if (campos.descricao.trim().length < 10) e.descricao = 'Descreva a situação (pelo menos 10 letras).'
    for (const campo of ['local', 'descricao', 'alternativa']) {
      if (DADOS_PESSOAIS.test(campos[campo])) e[campo] = 'Não escreva telefones, e-mails nem ligações.'
    }
    return e
  })

  const valido = computed(() => Object.keys(erros.value).length === 0)
  const erroDe = (campo) => (tocados[campo] ? (erros.value[campo] ?? '') : '')
  const marcarTocado = (campo) => (tocados[campo] = true)
  const marcarTodos = () => Object.keys(tocados).forEach((c) => (tocados[c] = true))

  function limpar() {
    campos.local = ''
    campos.descricao = ''
    campos.alternativa = ''
    Object.keys(tocados).forEach((c) => (tocados[c] = false))
  }

  return { campos, erros, valido, erroDe, marcarTocado, marcarTodos, limpar }
}
