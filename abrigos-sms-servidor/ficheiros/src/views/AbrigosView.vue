<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import EstadoPedido from '../components/EstadoPedido.vue'
import CartaoAbrigo from '../components/CartaoAbrigo.vue'
import CartaoCentro from '../components/CartaoCentro.vue'
import IconePerigo from '../components/IconePerigo.vue'
import { useLocalidade } from '../composables/useLocalidade'
import { useLocalizacao } from '../composables/useLocalizacao'
import { useAbrigos } from '../composables/useAbrigos'
import { useCentros } from '../composables/useCentros'
import { useCeu } from '../composables/useCeu'
import { PROVINCIAS, chaveProvincia, nomeProvincia } from '../utils/geo'
import { formatarNumero } from '../utils/tempo'

const route = useRoute()
const idCidade = computed(() => (/^\d+$/.test(String(route.query.cidade ?? '')) ? String(route.query.cidade) : ''))

const { cidade, erro: erroCidade } = useLocalidade(idCidade)
const { posicao, aObter, erro: erroLocalizacao, obter, limpar } = useLocalizacao()
const { maisAltos, altitudeOrigem, aCarregar, erro, carregar } = useAbrigos()
const { repor } = useCeu()
onMounted(repor)

// Província: a da localidade escolhida, ou a que o utilizador tocar na lista.
const provinciaEscolhida = ref('')
const provincia = computed(() => provinciaEscolhida.value || chaveProvincia(cidade.value?.provincia))

// Ponto de partida: a posição do utilizador (se a deu) ou o centro da localidade.
const origem = computed(() => {
  if (posicao.value) return { latitude: posicao.value.latitude, longitude: posicao.value.longitude }
  if (cidade.value)
    return { latitude: cidade.value.latitude, longitude: cidade.value.longitude, altitude: cidade.value.altitude ?? undefined }
  return null
})
const usaLocalizacao = computed(() => Boolean(posicao.value))

const centros = useCentros(provincia, origem)
const { lista: listaCentros, foraDaProvincia, nota: notaProvincia } = centros

function procurarEdificios() {
  if (origem.value) carregar(origem.value, origem.value)
}
watch(origem, procurarEdificios, { immediate: true })

async function usarLocalizacao() {
  provinciaEscolhida.value = ''
  await obter()
}

function escolherProvincia(id) {
  provinciaEscolhida.value = provinciaEscolhida.value === id ? '' : id
}

const tituloCentros = computed(() => {
  if (provincia.value) return `Onde as pessoas se abrigaram · ${nomeProvincia(provincia.value)}`
  if (usaLocalizacao.value) return 'Centros usados em emergências anteriores · mais perto de si'
  return 'Centros usados em emergências anteriores'
})
</script>

<template>
  <div class="pagina-abrigos">
    <header class="topo entra">
      <IconePerigo perigo="cheia" :tamanho="56" cor="#7cc8ff" />
      <div>
        <h1>Onde me abrigar</h1>
        <p class="texto-suave">
          Em cheias e ciclones, o INGD costuma abrir centros de acomodação, quase sempre em escolas.
        </p>
      </div>
    </header>

    <div class="cartao origem entra" style="--i: 1">
      <button type="button" class="botao largo" :disabled="aObter" @click="usarLocalizacao">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="3.5" fill="currentColor" />
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M12 1v3M12 20v3M1 12h3M20 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        {{ aObter ? 'A obter a localização…' : usaLocalizacao ? 'Actualizar a minha localização' : 'Usar a minha localização' }}
      </button>
      <p v-if="erroLocalizacao" class="erro" role="alert">{{ erroLocalizacao }}</p>
      <p v-if="erroCidade" class="erro" role="alert">{{ erroCidade }}</p>
      <p v-if="usaLocalizacao && altitudeOrigem !== null" class="altitude">
        Está a cerca de <strong>{{ formatarNumero(Math.round(altitudeOrigem)) }} m</strong> de altitude.
        <button v-if="cidade" type="button" class="ligacao" @click="limpar">Usar o centro de {{ cidade.nome }}</button>
      </p>
      <p v-else-if="cidade" class="altitude">
        {{ cidade.nome }} · {{ cidade.provincia }}
        <template v-if="altitudeOrigem !== null">
          · centro a <strong>{{ formatarNumero(Math.round(altitudeOrigem)) }} m</strong> de altitude
        </template>
      </p>

      <div v-if="!cidade" class="provincias">
        <span class="rotulo">Ou escolha a província:</span>
        <div class="chips">
          <button
            v-for="p in PROVINCIAS"
            :key="p.id"
            type="button"
            class="chip"
            :class="{ activo: provincia === p.id }"
            :aria-pressed="provincia === p.id"
            @click="escolherProvincia(p.id)"
          >
            {{ p.nome }}
          </button>
        </div>
      </div>
    </div>

    <!-- 1. Centros documentados em emergências anteriores -->
    <section v-if="provincia || origem" class="seccao" aria-labelledby="t-centros">
      <h2 id="t-centros" class="titulo-cartao">{{ tituloCentros }}</h2>
      <p v-if="notaProvincia" class="cartao aviso">{{ notaProvincia }}</p>
      <p v-if="foraDaProvincia" class="texto-suave pequeno">
        Não encontrámos registos públicos nesta província. Estes são os mais próximos noutras províncias:
      </p>
      <EstadoPedido
        :a-carregar="centros.aCarregar.value"
        :erro="centros.erro.value"
        :vazio="!centros.aCarregar.value && listaCentros.length === 0 && !notaProvincia"
        texto-vazio="Sem registos de centros de acomodação para esta zona."
        :esqueleto="[110, 110]"
        @tentar-novamente="centros.recarregar"
      >
        <ol class="lista">
          <CartaoCentro
            v-for="(c, i) in listaCentros"
            :key="c.id"
            :centro="c"
            :posicao="i"
            :mostrar-provincia="!provincia || foraDaProvincia"
          />
        </ol>
      </EstadoPedido>
    </section>

    <!-- 2. Outros edifícios públicos em terreno alto (mapa) -->
    <section v-if="origem" class="seccao" aria-labelledby="t-edificios">
      <h2 id="t-edificios" class="titulo-cartao">
        Outros edifícios públicos perto {{ usaLocalizacao ? 'de si' : `do centro de ${cidade?.nome ?? ''}` }}
      </h2>
      <EstadoPedido
        :a-carregar="aCarregar"
        :erro="erro ? 'O mapa de edifícios não respondeu agora. Os centros acima continuam válidos.' : ''"
        :vazio="!aCarregar && maisAltos.length === 0"
        texto-vazio="Não encontrámos outros edifícios públicos no mapa perto deste ponto."
        :esqueleto="[76, 76, 76]"
        @tentar-novamente="procurarEdificios"
      >
        <ol class="lista">
          <CartaoAbrigo
            v-for="(local, i) in maisAltos"
            :key="local.id"
            :local="local"
            :posicao="i"
            :a-partir-de="usaLocalizacao ? 'de si' : 'do centro'"
          />
        </ol>
      </EstadoPedido>
    </section>

    <p v-if="!provincia && !origem" class="cartao dica texto-suave">
      Use a sua localização, escolha a província ou
      <RouterLink :to="{ name: 'pesquisa' }">procure a sua localidade</RouterLink>.
    </p>

    <details class="cartao conselhos">
      <summary>O que levar e como sair em segurança</summary>
      <ul>
        <li>Documentos, medicamentos, água, lanterna e o carregador do telemóvel, num saco de plástico.</li>
        <li>Desligue a electricidade e o gás antes de sair.</li>
        <li>Não atravesse água a correr: 15 cm de água podem derrubar uma pessoa.</li>
        <li>Leve primeiro as crianças, os idosos e as pessoas com deficiência.</li>
        <li>Siga as orientações do INGD, dos líderes comunitários e da rádio local.</li>
      </ul>
    </details>

    <p class="aviso-final texto-suave">
      Lista feita a partir de notícias e relatórios públicos (fonte em cada centro) e do OpenStreetMap. Em cada
      emergência, os centros oficiais são definidos pelo INGD e pelas autoridades locais — confirme na rádio ou com o
      líder do bairro.
    </p>
  </div>
</template>

<style scoped>
.pagina-abrigos {
  max-width: 760px;
  margin: 0 auto;
}
.topo {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin: 1rem 0;
}
.topo h1 {
  margin: 0;
}
.topo p {
  margin: 0;
}
.origem {
  margin-bottom: 1.25rem;
}
.altitude,
.erro {
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
}
.erro {
  color: var(--erro);
}
.ligacao {
  display: block;
  margin-top: 0.3rem;
  padding: 0;
  border: 0;
  background: none;
  color: #fff;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
.provincias {
  margin-top: 0.9rem;
}
.rotulo {
  font-size: 0.85rem;
  color: var(--texto-suave);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.4rem;
}
.chip {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--vidro-borda);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.25s var(--mola);
}
.chip:hover {
  background: rgba(255, 255, 255, 0.18);
}
.chip.activo {
  background: #fff;
  color: var(--azul);
  font-weight: 650;
  transform: scale(1.05);
}
.seccao {
  margin-bottom: 1.25rem;
}
.aviso {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  background: rgba(250, 204, 21, 0.16);
  border-color: rgba(250, 204, 21, 0.4);
}
.pequeno {
  font-size: 0.85rem;
  margin: 0 0 0.6rem;
}
.lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.55rem;
}
.dica {
  font-size: 0.92rem;
}
.conselhos summary {
  cursor: pointer;
  font-weight: 600;
}
.conselhos ul {
  margin: 0.75rem 0 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.4rem;
  font-size: 0.92rem;
  animation: aparecer 0.3s var(--suave);
}
.aviso-final {
  margin-top: 1rem;
  font-size: 0.8rem;
  text-align: center;
}
</style>
