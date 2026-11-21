// Funções de geografia: distâncias e ligações para direcções.

/** Distância em km entre dois pontos (fórmula de Haversine). */
export function distanciaKm(a, b) {
  const raio = 6371
  const rad = (g) => (g * Math.PI) / 180
  const dLat = rad(b.latitude - a.latitude)
  const dLon = rad(b.longitude - a.longitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 2 * raio * Math.asin(Math.sqrt(h))
}

export function formatarDistancia(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(km < 10 ? 1 : 0).replace('.', ',')} km`
}

/** Ligação para abrir o caminho a pé no mapa do telemóvel. */
export function ligacaoDireccoes({ latitude, longitude }) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`
}

export function ligacaoMapa({ latitude, longitude }) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
}

/** Pesquisa um lugar pelo nome no mapa (útil quando só temos a localização aproximada). */
export function ligacaoPesquisaMapa(nome, local) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nome}, ${local}, Moçambique`)}`
}

const NOMES_PROVINCIAS = {
  niassa: 'Niassa',
  'cabo-delgado': 'Cabo Delgado',
  nampula: 'Nampula',
  zambezia: 'Zambézia',
  tete: 'Tete',
  manica: 'Manica',
  sofala: 'Sofala',
  inhambane: 'Inhambane',
  gaza: 'Gaza',
  'maputo-provincia': 'Maputo (província)',
  'maputo-cidade': 'Cidade de Maputo',
}
export const PROVINCIAS = Object.entries(NOMES_PROVINCIAS).map(([id, nome]) => ({ id, nome }))
export const nomeProvincia = (id) => NOMES_PROVINCIAS[id] ?? id

/**
 * Converte o nome da província que vem da API ("Província de Sofala", "Manica Province",
 * "Zambézia", "Cidade de Maputo"…) numa chave estável ("sofala", "manica", "maputo-cidade"…).
 */
export function chaveProvincia(texto) {
  if (!texto) return ''
  const t = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .trim()
  if (t.includes('cidade de maputo') || t === 'maputo city') return 'maputo-cidade'
  const limpo = t
    .replace(/^provincia (de|do|da) /, '')
    .replace(/ province$/, '')
    .trim()
  if (limpo === 'maputo') return 'maputo-provincia'
  return limpo.replace(/\s+/g, '-')
}
