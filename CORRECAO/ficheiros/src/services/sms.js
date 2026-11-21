// Alerta por SMS: o texto é montado aqui e enviado pela nossa função serverless (Twilio).
import { pedirServidor } from './servidor'
import { infoNivel } from '../utils/risco'
import { nomeDoDia } from '../utils/tempo'

// SMS sem acentos cabe em 160 caracteres por mensagem (com acentos são só 70).
export function semAcentos(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const nivel = (n) => infoNivel(n).rotulo.toUpperCase()

const ACCOES = { cheia: 'Va para um lugar alto', vento: 'Abrigue-se num edificio solido', seca: 'Poupe agua' }

/** Texto curto do alerta (cabe numa só SMS de 160 caracteres na maioria dos casos). */
export function montarTextoSms(cidade, riscos) {
  const { cheia, vento, seca, principal } = riscos
  const partes = [
    `Chuva Segura MZ - ${cidade.nome}`,
    `Cheia ${nivel(cheia.nivel)} (${Math.round(cheia.totalChuva)}mm/7d, pico ${nomeDoDia(cheia.diaMaisChuvoso.data).toLowerCase()})`,
    `Vento ${nivel(vento.nivel)} (${Math.round(vento.rajadaMax)}km/h)`,
  ]
  if (seca) partes.push(`Seca ${nivel(seca.nivel)}`)
  if (principal.nivel >= 2) partes.push(ACCOES[principal.id])
  partes.push('Siga INGD/INAM')
  return semAcentos(partes.join('. '))
}

/** Normaliza para +258XXXXXXXXX. Aceita "84 123 4567", "+258 84...", "25884...". */
export function normalizarTelefone(texto) {
  const digitos = String(texto).replace(/\D/g, '')
  if (digitos.length === 9) return `+258${digitos}`
  if (digitos.length === 12 && digitos.startsWith('258')) return `+${digitos}`
  return `+${digitos}`
}

export function enviarSms(telefone, texto) {
  return pedirServidor('/api/sms', { metodo: 'POST', corpo: { telefone, texto } })
}
