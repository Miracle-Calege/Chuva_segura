// Acesso às APIs públicas da Open-Meteo (sem chave, com suporte a CORS):
// - Geocoding API: localidades de Moçambique (dados do GeoNames), filtradas por countryCode=MZ
// - Forecast API: chuva, vento, rajadas e evaporação (últimos 30 dias + próximos 7)
// - Elevation API: altitude de pontos (para encontrar zonas altas)
// - Flood API: caudal dos rios (modelo GloFAS do programa Copernicus)
import { obterJSON, ErroPedido, DURACAO } from './http'
import { dataDeHoje } from '../utils/tempo'

const URL_GEOCODING = 'https://geocoding-api.open-meteo.com/v1'
const URL_PREVISAO = 'https://api.open-meteo.com/v1/forecast'
const URL_CHEIAS = 'https://flood-api.open-meteo.com/v1/flood'

const VARIAVEIS_DIARIAS = [
  'weather_code',
  'temperature_2m_max',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'et0_fao_evapotranspiration',
].join(',')

const VARIAVEIS_ACTUAIS = ['temperature_2m', 'is_day', 'weather_code', 'wind_speed_10m', 'wind_gusts_10m'].join(',')

// Dias de histórico pedidos (para avaliar a seca: chuva e evaporação dos últimos 30 dias).
const DIAS_PASSADOS = 30

// O GeoNames regista a cidade de Tete com o nome histórico "Vila-de-Santiago-Maior".
const NOMES_CORRENTES = { 1026014: 'Tete' }

// Duas casas decimais (~1 km) chegam para a previsão e aumentam as respostas reaproveitadas da cache.
const arredondar = (valor) => Math.round(valor * 100) / 100

function normalizarProvincia(admin1) {
  if (!admin1) return ''
  const emIngles = admin1.match(/^(.+) Province$/)
  return emIngles ? `Província de ${emIngles[1]}` : admin1
}

export function normalizarCidade(registo) {
  return {
    id: registo.id,
    nome: NOMES_CORRENTES[registo.id] ?? registo.name,
    provincia: normalizarProvincia(registo.admin1),
    distrito: registo.admin2 ?? '',
    latitude: registo.latitude,
    longitude: registo.longitude,
    altitude: registo.elevation ?? null,
    populacao: registo.population ?? null,
  }
}

/** Procura localidades habitadas (cidades, vilas, aldeias) de Moçambique pelo nome. */
export async function procurarCidades(termo) {
  const parametros = new URLSearchParams({
    name: termo,
    countryCode: 'MZ',
    count: '20',
    language: 'pt',
    format: 'json',
  })
  const dados = await obterJSON(`${URL_GEOCODING}/search?${parametros}`, { validadeMs: DURACAO.DIA })
  return (dados.results ?? [])
    .filter((r) => r.country_code === 'MZ' && r.feature_code?.startsWith('PPL'))
    .map(normalizarCidade)
}

/** Obtém uma localidade pelo identificador do GeoNames. */
export async function obterCidade(id) {
  const parametros = new URLSearchParams({ id: String(id), language: 'pt' })
  let dados
  try {
    dados = await obterJSON(`${URL_GEOCODING}/get?${parametros}`, { validadeMs: 7 * DURACAO.DIA })
  } catch (erro) {
    if (erro.tipo === 'servidor') {
      throw new ErroPedido('Não encontrámos esta localidade. Volte à pesquisa e escolha outra.', 'nao-encontrado')
    }
    throw erro
  }
  if (dados.country_code !== 'MZ') {
    throw new ErroPedido('Esta localidade não fica em Moçambique.', 'fora-de-mocambique')
  }
  return normalizarCidade(dados)
}

function converterDiario(diario) {
  if (!diario?.time) {
    throw new ErroPedido('A previsão recebida não tem o formato esperado.', 'formato')
  }
  return diario.time.map((data, i) => ({
    data,
    codigoTempo: diario.weather_code?.[i] ?? null,
    tempMax: diario.temperature_2m_max?.[i] ?? null,
    chuva: diario.precipitation_sum?.[i] ?? 0,
    probChuva: diario.precipitation_probability_max?.[i] ?? null,
    ventoMax: diario.wind_speed_10m_max?.[i] ?? null,
    rajadaMax: diario.wind_gusts_10m_max?.[i] ?? null,
    evaporacao: diario.et0_fao_evapotranspiration?.[i] ?? null,
  }))
}

function converterActual(actual) {
  if (!actual) return null
  return {
    hora: actual.time,
    temperatura: actual.temperature_2m ?? null,
    eDia: actual.is_day !== 0,
    codigoTempo: actual.weather_code ?? null,
    vento: actual.wind_speed_10m ?? null,
    rajada: actual.wind_gusts_10m ?? null,
  }
}

// Separa os dias passados (para a seca) dos dias de previsão (para cheias e vento).
function separarDias(dias) {
  const hoje = dataDeHoje()
  return { passado: dias.filter((d) => d.data < hoje), previsao: dias.filter((d) => d.data >= hoje) }
}

function parametrosPrevisao(latitudes, longitudes, diasPrevisao, actual) {
  return new URLSearchParams({
    latitude: latitudes,
    longitude: longitudes,
    current: actual,
    daily: VARIAVEIS_DIARIAS,
    timezone: 'Africa/Maputo',
    past_days: String(DIAS_PASSADOS),
    forecast_days: String(diasPrevisao),
  })
}

/**
 * Dados de uma localidade num só pedido: tempo actual, últimos 30 dias e previsão de 7 dias.
 * Devolve { actual, passado, previsao }.
 */
export async function obterPrevisao({ latitude, longitude }, dias = 7) {
  const parametros = parametrosPrevisao(arredondar(latitude), arredondar(longitude), dias, VARIAVEIS_ACTUAIS)
  const dados = await obterJSON(`${URL_PREVISAO}?${parametros}`, { validadeMs: DURACAO.HORA })
  return { actual: converterActual(dados.current), ...separarDias(converterDiario(dados.daily)) }
}

/**
 * O mesmo para várias localidades num ÚNICO pedido (a API aceita listas de coordenadas).
 * Devolve uma lista pela mesma ordem das localidades.
 */
export async function obterPrevisaoVarias(localidades, dias = 3) {
  const parametros = parametrosPrevisao(
    localidades.map((l) => arredondar(l.latitude)).join(','),
    localidades.map((l) => arredondar(l.longitude)).join(','),
    dias,
    'temperature_2m,is_day,weather_code',
  )
  const dados = await obterJSON(`${URL_PREVISAO}?${parametros}`, { validadeMs: DURACAO.HORA })
  const lista = Array.isArray(dados) ? dados : [dados]
  return lista.map((item) => ({ actual: converterActual(item.current), ...separarDias(converterDiario(item.daily)) }))
}

/** Altitude (m) de vários pontos num só pedido (máximo 100 pontos). */
export async function obterAltitudes(pontos) {
  if (pontos.length === 0) return []
  const parametros = new URLSearchParams({
    latitude: pontos.map((p) => p.latitude.toFixed(5)).join(','),
    longitude: pontos.map((p) => p.longitude.toFixed(5)).join(','),
  })
  const dados = await obterJSON(`https://api.open-meteo.com/v1/elevation?${parametros}`, { validadeMs: 30 * DURACAO.DIA })
  return dados.elevation ?? []
}

/**
 * Caudal do rio mais próximo (m³/s): últimos 30 dias e previsão de 7 dias.
 * Devolve null quando não há rio modelado perto do ponto.
 */
export async function obterCaudal({ latitude, longitude }) {
  const parametros = new URLSearchParams({
    latitude: arredondar(latitude),
    longitude: arredondar(longitude),
    daily: 'river_discharge',
    past_days: '30',
    forecast_days: '7',
  })
  const dados = await obterJSON(`${URL_CHEIAS}?${parametros}`, { validadeMs: 3 * DURACAO.HORA })
  const datas = dados.daily?.time ?? []
  const valores = dados.daily?.river_discharge ?? []
  const hoje = dataDeHoje()
  const passado = []
  const futuro = []
  datas.forEach((data, i) => {
    const valor = valores[i]
    if (valor === null || valor === undefined) return
    ;(data < hoje ? passado : futuro).push({ data, valor })
  })
  if (passado.length === 0 && futuro.length === 0) return null
  return { passado, futuro }
}
