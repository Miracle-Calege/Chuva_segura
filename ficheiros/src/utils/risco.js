// Avaliação do risco de CHEIA, CICLONE / VENTO FORTE e SECA para uma localidade.
//
// Critérios definidos pelo grupo a partir dos dados da Open-Meteo e do GloFAS.
// NÃO são os critérios oficiais do INAM nem do INGD — servem para orientar e alertar cedo.

export const LIMIARES = {
  // Cheia (chuva acumulada num dia, mm)
  chuvaModerada: 20,
  chuvaForte: 50,
  chuvaMuitoForte: 100,
  chuva3Dias: 150, // 3 dias seguidos: solo saturado
  caudalRelevante: 5, // m³/s: abaixo disto o curso de água é pequeno
  subidaCaudal: 2, // caudal previsto ≥ 2× o normal recente → sobe um nível

  // Ciclone / vento (km/h)
  rajadaModerada: 60,
  ventoTempestade: 62, // tempestade tropical (vento médio)
  rajadaForte: 90,
  ventoCiclone: 89, // tempestade tropical severa
  rajadaCiclone: 118, // força de ciclone

  // Seca (balanço hídrico dos últimos 30 dias = chuva − evaporação, mm)
  balancoModerado: -60,
  balancoAlto: -100,
  balancoMuitoAlto: -130,
  diasSecosModerado: 14,
  diasSecosAlto: 21,
  diasSecosMuitoAlto: 30,
}

export const NIVEIS = [
  { id: 'baixo', rotulo: 'Baixo' },
  { id: 'moderado', rotulo: 'Moderado' },
  { id: 'alto', rotulo: 'Alto' },
  { id: 'muito-alto', rotulo: 'Muito alto' },
]

export const PERIGOS = {
  cheia: {
    nome: 'Cheia',
    conselhos: [
      'Sem chuva forte prevista. Mantenha as valas e drenagens limpas.',
      'Pode chover bastante. Evite atravessar ruas, pontes e rios alagados.',
      'Chuva forte prevista. Guarde documentos e bens num lugar alto, carregue o telemóvel e veja onde fica o abrigo mais próximo.',
      'Risco elevado de cheia. Se vive numa zona baixa ou perto de um rio, vá para um lugar alto e siga as orientações do INGD e das autoridades locais.',
    ],
  },
  vento: {
    nome: 'Ciclone e vento',
    conselhos: [
      'Sem vento forte previsto.',
      'Rajadas fortes possíveis. Prenda chapas, objectos soltos e evite árvores grandes.',
      'Vento de tempestade previsto. Reforce o telhado, guarde água e alimentos e acompanhe os avisos do INAM na rádio.',
      'Vento com força de ciclone. Abrigue-se num edifício sólido, longe de janelas, e siga as orientações do INGD.',
    ],
  },
  seca: {
    nome: 'Seca',
    conselhos: [
      'Sem sinais de falta de água.',
      'Pouca chuva nas últimas semanas. Poupe água e proteja as sementeiras.',
      'Falta de chuva prolongada. Guarde água, use a rega com cuidado e acompanhe os avisos da agricultura e do INGD.',
      'Seca severa. Racione a água, proteja os animais e procure apoio junto das autoridades locais.',
    ],
  },
}

export function infoNivel(nivel) {
  return NIVEIS[Math.max(0, Math.min(NIVEIS.length - 1, nivel))]
}

const soma = (lista, campo) => lista.reduce((t, d) => t + (d[campo] ?? 0), 0)
const arredondar1 = (v) => Math.round(v * 10) / 10

function mediana(valores) {
  const ordenados = [...valores].sort((a, b) => a - b)
  const meio = Math.floor(ordenados.length / 2)
  return ordenados.length % 2 ? ordenados[meio] : (ordenados[meio - 1] + ordenados[meio]) / 2
}

// ---------------- Cheia ----------------

export function nivelChuvaDia(chuva) {
  if (chuva >= LIMIARES.chuvaMuitoForte) return 3
  if (chuva >= LIMIARES.chuvaForte) return 2
  if (chuva >= LIMIARES.chuvaModerada) return 1
  return 0
}

/** Compara o caudal previsto do rio com o dos últimos 30 dias. */
export function avaliarCaudal(caudal) {
  if (!caudal || caudal.passado.length === 0 || caudal.futuro.length === 0) return null
  const medianaPassado = mediana(caudal.passado.map((p) => p.valor))
  const maximoPrevisto = Math.max(...caudal.futuro.map((p) => p.valor))
  const razao = medianaPassado > 0 ? maximoPrevisto / medianaPassado : null
  const relevante = medianaPassado >= LIMIARES.caudalRelevante
  let tendencia = 'estável'
  if (razao !== null && razao >= 1.5) tendencia = 'a subir'
  else if (razao !== null && razao <= 0.67) tendencia = 'a descer'
  return {
    medianaPassado,
    maximoPrevisto,
    razao,
    relevante,
    tendencia,
    subidaForte: relevante && razao !== null && razao >= LIMIARES.subidaCaudal,
  }
}

export function avaliarCheia(previsao, caudal = null) {
  const dias = previsao.map((d) => ({ ...d, nivelChuva: nivelChuvaDia(d.chuva ?? 0) }))
  let nivel = Math.max(0, ...dias.map((d) => d.nivelChuva))
  for (let i = 0; i + 2 < dias.length; i++) {
    if ((dias[i].chuva ?? 0) + (dias[i + 1].chuva ?? 0) + (dias[i + 2].chuva ?? 0) >= LIMIARES.chuva3Dias) nivel = 3
  }
  const rio = avaliarCaudal(caudal)
  if (rio?.subidaForte) nivel = Math.min(3, nivel + 1)
  const diaMaisChuvoso = dias.reduce((a, b) => ((b.chuva ?? 0) > (a.chuva ?? 0) ? b : a), dias[0])
  return {
    nivel,
    conselho: PERIGOS.cheia.conselhos[nivel],
    totalChuva: arredondar1(soma(dias, 'chuva')),
    diaMaisChuvoso,
    dias,
    rio,
  }
}

// ---------------- Ciclone / vento ----------------

export function avaliarVento(previsao) {
  let nivel = 0
  let diaCritico = previsao[0]
  for (const d of previsao) {
    const vento = d.ventoMax ?? 0
    const rajada = d.rajadaMax ?? 0
    let n = 0
    if (vento >= LIMIARES.ventoCiclone || rajada >= LIMIARES.rajadaCiclone) n = 3
    else if (vento >= LIMIARES.ventoTempestade || rajada >= LIMIARES.rajadaForte) n = 2
    else if (rajada >= LIMIARES.rajadaModerada) n = 1
    if (n > nivel || (n === nivel && rajada > (diaCritico.rajadaMax ?? 0))) {
      nivel = Math.max(nivel, n)
      diaCritico = d
    }
  }
  return {
    nivel,
    conselho: PERIGOS.vento.conselhos[nivel],
    rajadaMax: Math.max(0, ...previsao.map((d) => d.rajadaMax ?? 0)),
    ventoMax: Math.max(0, ...previsao.map((d) => d.ventoMax ?? 0)),
    diaCritico,
  }
}

// ---------------- Seca ----------------

/** Maio a Outubro é a época seca: chover pouco é normal, por isso o nível desce um grau. */
export function eEpocaSeca(dataIso) {
  const mes = Number(dataIso.slice(5, 7))
  return mes >= 5 && mes <= 10
}

export function avaliarSeca(passado, previsao) {
  if (!passado || passado.length === 0) return null
  const chuva30 = soma(passado, 'chuva')
  const evaporacao30 = soma(passado, 'evaporacao')
  const balanco = chuva30 - evaporacao30
  let diasSemChuva = 0
  for (let i = passado.length - 1; i >= 0 && (passado[i].chuva ?? 0) < 1; i--) diasSemChuva++
  const chuvaPrevista = soma(previsao, 'chuva')

  let nivel = 0
  if (balanco <= LIMIARES.balancoMuitoAlto && diasSemChuva >= LIMIARES.diasSecosMuitoAlto && chuvaPrevista < 5) nivel = 3
  else if (balanco <= LIMIARES.balancoAlto && diasSemChuva >= LIMIARES.diasSecosAlto && chuvaPrevista < 10) nivel = 2
  else if (balanco <= LIMIARES.balancoModerado && diasSemChuva >= LIMIARES.diasSecosModerado) nivel = 1

  const epocaSeca = eEpocaSeca(passado[passado.length - 1].data)
  if (epocaSeca) nivel = Math.max(0, nivel - 1)

  return {
    nivel,
    conselho: PERIGOS.seca.conselhos[nivel],
    chuva30: arredondar1(chuva30),
    evaporacao30: arredondar1(evaporacao30),
    balanco: arredondar1(balanco),
    diasSemChuva,
    chuvaPrevista: arredondar1(chuvaPrevista),
    epocaSeca,
  }
}

// ---------------- Conjunto ----------------

/**
 * Avalia os três perigos e devolve o mais grave como "principal".
 * @param dados { passado, previsao } (resultado de obterPrevisao)
 * @param caudal resultado de obterCaudal (opcional)
 */
export function avaliarRiscos(dados, caudal = null) {
  if (!dados?.previsao?.length) return null
  const cheia = avaliarCheia(dados.previsao, caudal)
  const vento = avaliarVento(dados.previsao)
  const seca = avaliarSeca(dados.passado, dados.previsao)
  const lista = [
    { id: 'cheia', ...PERIGOS.cheia, ...cheia },
    { id: 'vento', ...PERIGOS.vento, ...vento },
    ...(seca ? [{ id: 'seca', ...PERIGOS.seca, ...seca }] : []),
  ]
  // o mais grave; em empate, a ordem cheia > vento > seca
  const principal = lista.reduce((a, b) => (b.nivel > a.nivel ? b : a))
  return { nivel: principal.nivel, principal, cheia, vento, seca, lista }
}

/** Cor CSS de um nível (para ícones e gráficos). */
export function corNivel(nivel) {
  return `var(--risco-${infoNivel(nivel).id})`
}
