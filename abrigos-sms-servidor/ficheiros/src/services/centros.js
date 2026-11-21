// Centros de acomodação usados em cheias e ciclones anteriores (lista recolhida de notícias e
// relatórios públicos e guardada em public/dados/centros-acomodacao.json, com a fonte de cada um).
import { obterJSON, DURACAO } from './http'

export async function obterCentros() {
  return obterJSON(`${import.meta.env.BASE_URL}dados/centros-acomodacao.json`, { validadeMs: DURACAO.DIA })
}
