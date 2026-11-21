// Descarrega os eventos de ciclones (TC), cheias (FL) e secas (DR) que afectam Moçambique
// do GDACS (Global Disaster Alert and Coordination System — Nações Unidas / Comissão Europeia)
// e grava uma cópia leve em public/dados/gdacs-mz.json.
//
// Corre automaticamente no GitHub Actions antes de cada publicação (e de 3 em 3 horas),
// porque a API do GDACS não foi pensada para ser chamada directamente do browser.
// Uso local: npm run dados
import { writeFile } from 'node:fs/promises'

const hoje = new Date()
const umAnoAtras = new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000)
const data = (d) => d.toISOString().slice(0, 10)

const url =
  'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?' +
  new URLSearchParams({
    eventlist: 'TC;FL;DR',
    country: 'Mozambique',
    fromDate: data(umAnoAtras),
    toDate: data(hoje),
  })

const resposta = await fetch(url, { headers: { Accept: 'application/json' } })
if (!resposta.ok) throw new Error(`GDACS respondeu ${resposta.status}`)
const geo = await resposta.json()

const eventos = (geo.features ?? [])
  .map(({ properties: p, geometry }) => ({
    id: `${p.eventtype}-${p.eventid}`,
    tipo: p.eventtype, // TC | FL | DR
    nome: p.name,
    nivel: p.alertlevel, // Green | Orange | Red
    actual: p.iscurrent === 'true' || p.iscurrent === true,
    paises: p.country,
    inicio: p.fromdate,
    fim: p.todate,
    severidade: p.severitydata?.severitytext?.trim() ?? '',
    coordenadas: geometry?.coordinates ?? null,
    relatorio: p.url?.report ?? '',
  }))
  .sort((a, b) => (b.inicio ?? '').localeCompare(a.inicio ?? ''))

const saida = {
  fonte: 'GDACS — Global Disaster Alert and Coordination System (https://www.gdacs.org)',
  licenca: 'Dados públicos do GDACS; citar a fonte (ver termos em https://www.gdacs.org)',
  actualizadoEm: hoje.toISOString(),
  eventos,
}

await writeFile(new URL('../public/dados/gdacs-mz.json', import.meta.url), JSON.stringify(saida, null, 2) + '\n')
console.log(`GDACS: ${eventos.length} eventos gravados em public/dados/gdacs-mz.json`)
