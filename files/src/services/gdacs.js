// Avisos internacionais de desastres (GDACS) que afectam Moçambique.
// Os dados são copiados para public/dados/gdacs-mz.json pelo GitHub Actions (scripts/actualizar-gdacs.mjs).
import { obterJSON, DURACAO } from './http'

const NOMES_TIPO = { TC: 'Ciclone tropical', FL: 'Cheia', DR: 'Seca' }
const NIVEIS_GDACS = { Green: 0, Orange: 2, Red: 3 }

function traduzirNome(evento) {
  // "Tropical Cyclone JUDE-25" → "Ciclone tropical JUDE-25"; "Flood in Mozambique" → "Cheia"
  const nomeProprio = evento.nome.match(/([A-Z]+-\d{2})$/)?.[1]
  return nomeProprio ? `${NOMES_TIPO[evento.tipo]} ${nomeProprio}` : NOMES_TIPO[evento.tipo] ?? evento.nome
}

function traduzirPaises(paises) {
  return paises
    .replace('Mozambique', 'Moçambique')
    .replace('South Africa', 'África do Sul')
    .replace('Zimbabwe', 'Zimbabué')
    .replace('Comoros', 'Comores')
    .replace('Malawi', 'Malawi')
}

export async function obterAvisosGdacs() {
  const dados = await obterJSON(`${import.meta.env.BASE_URL}dados/gdacs-mz.json`, { validadeMs: 30 * DURACAO.MINUTO })
  return {
    actualizadoEm: dados.actualizadoEm,
    eventos: (dados.eventos ?? []).map((e) => ({
      ...e,
      titulo: traduzirNome(e),
      tipoNome: NOMES_TIPO[e.tipo] ?? e.tipo,
      paises: traduzirPaises(e.paises ?? ''),
      nivelApp: NIVEIS_GDACS[e.nivel] ?? 0,
      ventoMax: Number(e.severidade.match(/(\d+)\s*km\/h/)?.[1]) || null,
    })),
  }
}
