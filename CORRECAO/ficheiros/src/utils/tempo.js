// Funções de apoio para datas e para descrever o estado do tempo em português.

const FUSO = 'Africa/Maputo'

/** Data de hoje em Moçambique, no formato AAAA-MM-DD. */
export function dataDeHoje() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date())
}

// As datas da API vêm como "AAAA-MM-DD" (já no fuso de Maputo). Lemo-las em UTC para não mudarem de dia.
function lerData(iso) {
  return new Date(`${iso}T12:00:00Z`)
}

/** Ex.: "22 nov." */
export function formatarDiaCurto(iso) {
  return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(lerData(iso))
}

/** Rótulo de 3 letras para gráficos: "Hoje", "dom", "seg", … */
export function nomeDoDiaAbreviado(iso) {
  const nome = nomeDoDia(iso)
  return nome === 'Hoje' ? nome : nome.slice(0, 3)
}

/** Ex.: "sábado, 22 de novembro" */
export function formatarDiaLongo(iso) {
  return new Intl.DateTimeFormat('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(lerData(iso))
}

/** "Hoje", "Amanhã" ou o dia da semana abreviado. */
export function nomeDoDia(iso) {
  const hoje = dataDeHoje()
  if (iso === hoje) return 'Hoje'
  const amanha = new Date(lerData(hoje).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  if (iso === amanha) return 'Amanhã'
  return new Intl.DateTimeFormat('pt-PT', { weekday: 'short', timeZone: 'UTC' }).format(lerData(iso))
}

// Códigos de tempo da Organização Meteorológica Mundial (WMO) usados pela Open-Meteo.
const CODIGOS_TEMPO = {
  0: ['Céu limpo', '☀️'],
  1: ['Pouco nublado', '🌤️'],
  2: ['Parcialmente nublado', '⛅'],
  3: ['Nublado', '☁️'],
  45: ['Nevoeiro', '🌫️'],
  48: ['Nevoeiro', '🌫️'],
  51: ['Chuvisco fraco', '🌦️'],
  53: ['Chuvisco', '🌦️'],
  55: ['Chuvisco forte', '🌧️'],
  56: ['Chuvisco gelado', '🌧️'],
  57: ['Chuvisco gelado', '🌧️'],
  61: ['Chuva fraca', '🌦️'],
  63: ['Chuva moderada', '🌧️'],
  65: ['Chuva forte', '🌧️'],
  66: ['Chuva gelada', '🌧️'],
  67: ['Chuva gelada forte', '🌧️'],
  71: ['Neve fraca', '🌨️'],
  73: ['Neve', '🌨️'],
  75: ['Neve forte', '🌨️'],
  77: ['Grãos de neve', '🌨️'],
  80: ['Aguaceiros fracos', '🌦️'],
  81: ['Aguaceiros', '🌧️'],
  82: ['Aguaceiros violentos', '⛈️'],
  85: ['Aguaceiros de neve', '🌨️'],
  86: ['Aguaceiros de neve', '🌨️'],
  95: ['Trovoada', '⛈️'],
  96: ['Trovoada com granizo', '⛈️'],
  99: ['Trovoada com granizo', '⛈️'],
}

export function descreverTempo(codigo) {
  const [texto, icone] = CODIGOS_TEMPO[codigo] ?? ['Sem informação', '❔']
  return { texto, icone }
}

const numero = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 })
export function formatarNumero(valor) {
  return valor === null || valor === undefined ? '—' : numero.format(valor)
}

/** Tipo de ícone para um código de tempo: sol, sol-nuvem, nuvens, nevoeiro, chuvisco, chuva, trovoada, neve. */
export function tipoTempo(codigo) {
  if (codigo === null || codigo === undefined) return 'nuvens'
  if (codigo === 0) return 'sol'
  if (codigo <= 2) return 'sol-nuvem'
  if (codigo === 3) return 'nuvens'
  if (codigo === 45 || codigo === 48) return 'nevoeiro'
  if ((codigo >= 51 && codigo <= 57) || codigo === 61 || codigo === 80) return 'chuvisco'
  if ((codigo >= 63 && codigo <= 67) || codigo === 81 || codigo === 82) return 'chuva'
  if (codigo >= 71 && codigo <= 77) return 'neve'
  if (codigo === 85 || codigo === 86) return 'neve'
  if (codigo >= 95) return 'trovoada'
  return 'nuvens'
}

/** Céu de fundo da aplicação: limpo, nublado, chuva, trovoada ou noite. */
export function ceuDe(codigo, eDia = true) {
  const tipo = tipoTempo(codigo)
  if (tipo === 'trovoada') return 'trovoada'
  if (tipo === 'chuva' || tipo === 'chuvisco') return 'chuva'
  if (!eDia) return 'noite'
  if (tipo === 'nuvens' || tipo === 'nevoeiro') return 'nublado'
  return 'limpo'
}

/** É de dia em Maputo (entre as 6h e as 18h)? */
export function eDiaEmMocambique() {
  const hora = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: FUSO }).format(new Date()))
  return hora >= 6 && hora < 18
}

/** "2026-11-21T14:00" → "14h" */
export function formatarHora(isoLocal) {
  return `${isoLocal.slice(11, 13)}h`
}

export function graus(valor) {
  return valor === null || valor === undefined ? '—' : Math.round(valor)
}
