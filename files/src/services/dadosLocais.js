// Datasets guardados no próprio repositório (pasta public/dados), carregados com fetch.
import { obterJSON, DURACAO } from './http'

/** Lista das capitais provinciais (cópia de registos do GeoNames — ver campos fonte/licenca do ficheiro). */
export async function obterCapitais() {
  const dados = await obterJSON(`${import.meta.env.BASE_URL}dados/capitais-provinciais.json`, {
    validadeMs: DURACAO.DIA,
  })
  return dados.cidades ?? []
}
