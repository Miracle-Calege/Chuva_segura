// Possíveis abrigos em caso de cheia: edifícios públicos e sólidos (escolas, unidades sanitárias,
// igrejas, mesquitas, centros comunitários…) em TERRENO MAIS ALTO perto da localidade.
// - Edifícios: OpenStreetMap, através da Overpass API (ODbL)
// - Altitude: Open-Meteo Elevation API (modelo Copernicus DEM, 90 m)
// Em Moçambique, as escolas são muitas vezes usadas como centros de acomodação, mas os centros
// oficiais são definidos pelo INGD e pelas autoridades locais.
import { obterJSON, ErroPedido, DURACAO } from './http'
import { obterAltitudes } from './openMeteo'
import { distanciaKm } from '../utils/geo'

const SERVIDORES_OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']

const TIPOS = {
  shelter: { nome: 'Abrigo', prioridade: 5 },
  assembly_point: { nome: 'Ponto de encontro', prioridade: 5 },
  school: { nome: 'Escola', prioridade: 4 },
  college: { nome: 'Instituto', prioridade: 4 },
  university: { nome: 'Universidade', prioridade: 4 },
  community_centre: { nome: 'Centro comunitário', prioridade: 4 },
  hospital: { nome: 'Hospital', prioridade: 3 },
  clinic: { nome: 'Centro de saúde', prioridade: 3 },
  place_of_worship: { nome: 'Local de culto', prioridade: 3 },
  townhall: { nome: 'Administração', prioridade: 3 },
  police: { nome: 'Polícia', prioridade: 2 },
  fire_station: { nome: 'Bombeiros', prioridade: 2 },
}

const MAXIMO_PONTOS = 100 // limite da Elevation API por pedido

function montarConsulta({ latitude, longitude }, raioM) {
  const perto = `(around:${raioM},${latitude.toFixed(4)},${longitude.toFixed(4)})`
  const amenidades = Object.keys(TIPOS).filter((t) => t !== 'assembly_point').join('|')
  return `[out:json][timeout:25];(nwr${perto}["amenity"~"^(${amenidades})$"];nwr${perto}["emergency"="assembly_point"];nwr${perto}["social_facility"="shelter"];);out center 200;`
}

async function consultarOverpass(consulta) {
  let ultimoErro
  for (const servidor of SERVIDORES_OVERPASS) {
    try {
      return await obterJSON(`${servidor}?data=${encodeURIComponent(consulta)}`, {
        validadeMs: DURACAO.DIA,
        tempoLimiteMs: 20000,
      })
    } catch (e) {
      ultimoErro = e // tenta o servidor seguinte
    }
  }
  throw ultimoErro ?? new ErroPedido('Não foi possível obter os edifícios do mapa.', 'rede')
}

function converterElemento(el) {
  const t = el.tags ?? {}
  const chave = t.emergency === 'assembly_point' ? 'assembly_point' : t.social_facility === 'shelter' ? 'shelter' : t.amenity
  const tipo = TIPOS[chave]
  const latitude = el.lat ?? el.center?.lat
  const longitude = el.lon ?? el.center?.lon
  if (!tipo || latitude === undefined || longitude === undefined) return null
  let tipoNome = tipo.nome
  if (chave === 'place_of_worship') tipoNome = t.religion === 'muslim' ? 'Mesquita' : t.religion === 'christian' ? 'Igreja' : tipo.nome
  return {
    id: `${el.type}-${el.id}`,
    nome: t.name || t['name:pt'] || `${tipoNome} sem nome no mapa`,
    temNome: Boolean(t.name || t['name:pt']),
    tipo: chave,
    tipoNome,
    prioridade: tipo.prioridade,
    latitude,
    longitude,
  }
}

/**
 * Procura possíveis abrigos em terreno alto.
 * @param centro  { latitude, longitude } — centro da localidade
 * @param origem  { latitude, longitude, altitude? } — de onde a pessoa sai (localização actual ou centro)
 * @returns { altitudeOrigem, locais: [...] } ordenados do mais adequado para o menos adequado
 */
export async function procurarAbrigos(centro, origem, raioM = 4000) {
  const dados = await consultarOverpass(montarConsulta(centro, raioM))
  let locais = (dados.elements ?? []).map(converterElemento).filter(Boolean)

  // Os mais prioritários e mais próximos primeiro, até ao limite da Elevation API (1 ponto fica para a origem)
  locais = locais
    .map((l) => ({ ...l, distanciaKm: distanciaKm(origem, l) }))
    .sort((a, b) => b.prioridade - a.prioridade || a.distanciaKm - b.distanciaKm)
    .slice(0, MAXIMO_PONTOS - 1)

  const altitudes = await obterAltitudes([origem, ...locais])
  const altitudeOrigem = origem.altitude ?? altitudes[0] ?? null
  locais = locais.map((l, i) => {
    const altitude = altitudes[i + 1] ?? null
    return { ...l, altitude, desnivel: altitude !== null && altitudeOrigem !== null ? altitude - altitudeOrigem : null }
  })

  // Pontuação: subir em altitude conta muito, a distância penaliza, edifícios mais adequados ganham.
  const pontuar = (l) => (l.desnivel ?? 0) * 1.5 - l.distanciaKm * 4 + l.prioridade * 2 + (l.temNome ? 1 : 0)
  locais.sort((a, b) => pontuar(b) - pontuar(a))

  return { altitudeOrigem, locais }
}
