<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import EstadoPedido from '../components/EstadoPedido.vue'
import IndicadorRisco from '../components/IndicadorRisco.vue'
import IconeTempo from '../components/IconeTempo.vue'
import IconePerigo from '../components/IconePerigo.vue'
import CartaoPerigo from '../components/CartaoPerigo.vue'
import GraficoChuva from '../components/GraficoChuva.vue'
import CartaoCaudal from '../components/CartaoCaudal.vue'
import CartaoRelato from '../components/CartaoRelato.vue'
import { usePrevisaoCidade } from '../composables/usePrevisaoCidade'
import { useRelatos } from '../composables/useRelatos'
import { useCeu } from '../composables/useCeu'
import { corNivel, LIMIARES } from '../utils/risco'
import { ceuDe, descreverTempo, formatarDiaLongo, formatarNumero, graus, nomeDoDia, nomeDoDiaAbreviado } from '../utils/tempo'

// O parâmetro :id da rota chega como prop (props: true no router).
const props = defineProps({ id: { type: String, required: true } })

const { cidade, actual, caudal, riscos, aCarregar, erro, avisoCaudal, recarregar } = usePrevisaoCidade(() => props.id)
const { relatos, reagidos, reagir } = useRelatos(() => props.id)
const ultimosRelatos = computed(() => relatos.value.slice(0, 3))

// O fundo da aplicação acompanha o tempo actual da localidade.
const { definirCeu } = useCeu()
watch(actual, (a) => a && definirCeu(ceuDe(a.codigoTempo, a.eDia)), { immediate: true })

// Cartão de perigo aberto: começa pelo mais grave
const aberto = ref('')
watch(
  riscos,
  (r, anterior) => {
    if (r && !anterior) aberto.value = r.principal.id
  },
  { immediate: true },
)
watch(
  () => props.id,
  () => (aberto.value = ''),
)
const alternar = (id) => (aberto.value = aberto.value === id ? '' : id)

const diaSeleccionado = ref('')
const diaEscolhido = computed(() => riscos.value?.cheia.dias.find((d) => d.data === diaSeleccionado.value) ?? null)
async function seleccionarDia(data) {
  diaSeleccionado.value = diaSeleccionado.value === data ? '' : data
  await nextTick()
}

const tituloEstado = computed(() => {
  const r = riscos.value
  if (!r) return ''
  if (r.nivel === 0) return 'Sem perigos previstos'
  return `${r.principal.nome}: risco ${r.principal.nivel === 3 ? 'muito alto' : r.principal.nivel === 2 ? 'alto' : 'moderado'}`
})

// Barra do balanço hídrico da seca: de −150 mm (muito seco) a +150 mm (húmido)
const posicaoBalanco = computed(() => {
  const b = riscos.value?.seca?.balanco ?? 0
  return `${Math.min(100, Math.max(0, ((b + 150) / 300) * 100))}%`
})
</script>

<template>
  <div class="pagina-cidade">
    <RouterLink :to="{ name: 'pesquisa' }" class="voltar"><span aria-hidden="true">‹</span> Pesquisar</RouterLink>

    <EstadoPedido
      :a-carregar="aCarregar && !riscos"
      :erro="erro"
      :vazio="!aCarregar && !erro && !riscos"
      texto-carregar="A avaliar os riscos…"
      texto-vazio="Não há dados disponíveis para esta localidade."
      :esqueleto="[90, 200, 72, 72, 72]"
      @tentar-novamente="recarregar"
    >
      <template v-if="cidade && riscos">
        <header class="cabeca entra">
          <div>
            <h1>{{ cidade.nome }}</h1>
            <p class="texto-suave">{{ cidade.provincia || 'Moçambique' }}</p>
          </div>
          <div v-if="actual" class="agora" :title="descreverTempo(actual.codigoTempo).texto">
            <IconeTempo :codigo="actual.codigoTempo" :e-dia="actual.eDia" :tamanho="40" />
            <span>{{ graus(actual.temperatura) }}°</span>
          </div>
        </header>

        <!-- Estado geral: o perigo mais grave -->
        <section class="cartao estado entra" :class="`nivel-${riscos.nivel}`" style="--i: 1" aria-live="polite">
          <div class="estado-topo">
            <IconePerigo
              :perigo="riscos.nivel === 0 ? 'ok' : riscos.principal.id"
              :tamanho="72"
              :cor="corNivel(riscos.nivel)"
            />
            <div>
              <p class="rotulo">Nível de alerta</p>
              <h2>{{ tituloEstado }}</h2>
              <IndicadorRisco :nivel="riscos.nivel" tamanho="grande" prefixo="" />
            </div>
          </div>
          <p class="conselho">{{ riscos.principal.conselho }}</p>
          <div class="accoes">
            <RouterLink :to="{ name: 'abrigos', query: { cidade: cidade.id } }" class="botao">🏫 Onde me abrigar</RouterLink>
            <RouterLink :to="{ name: 'sms', params: { id: cidade.id } }" class="botao secundario">📱 Alerta por SMS</RouterLink>
          </div>
        </section>

        <h2 class="titulo-cartao seccao">Perigos nos próximos 7 dias</h2>

        <!-- CHEIA -->
        <CartaoPerigo
          :perigo="{ id: 'cheia', ...riscos.cheia, nome: 'Cheia' }"
          :resumo="`${formatarNumero(riscos.cheia.totalChuva)} mm de chuva em 7 dias`"
          :aberto="aberto === 'cheia'"
          class="entra"
          style="--i: 2"
          @alternar="alternar"
        >
          <GraficoChuva
            :dias="riscos.cheia.dias"
            :data-seleccionada="diaSeleccionado"
            @seleccionar-dia="seleccionarDia"
          />
          <p v-if="diaEscolhido" class="dia-escolhido">
            <strong>{{ formatarDiaLongo(diaEscolhido.data) }}:</strong>
            {{ formatarNumero(diaEscolhido.chuva) }} mm, probabilidade {{ diaEscolhido.probChuva ?? '—' }}% ·
            {{ descreverTempo(diaEscolhido.codigoTempo).texto }}
          </p>
          <CartaoCaudal class="rio" :serie="caudal" :avaliacao="riscos.cheia.rio" :aviso="avisoCaudal" />
          <p v-if="cidade.altitude !== null && cidade.altitude < 20" class="nota">
            ⚠️ {{ cidade.nome }} fica a {{ formatarNumero(cidade.altitude) }} m de altitude: zona baixa, mais exposta a cheias.
          </p>
        </CartaoPerigo>

        <!-- CICLONE / VENTO -->
        <CartaoPerigo
          :perigo="{ id: 'vento', ...riscos.vento, nome: 'Ciclone e vento' }"
          :resumo="`Rajadas até ${graus(riscos.vento.rajadaMax)} km/h`"
          :aberto="aberto === 'vento'"
          class="entra"
          style="--i: 3"
          @alternar="alternar"
        >
          <ol class="barras-vento">
            <li v-for="d in riscos.cheia.dias" :key="d.data">
              <span class="dia">{{ nomeDoDiaAbreviado(d.data) }}</span>
              <span class="pista">
                <span
                  class="barra"
                  :class="{
                    forte: (d.rajadaMax ?? 0) >= LIMIARES.rajadaForte,
                    media: (d.rajadaMax ?? 0) >= LIMIARES.rajadaModerada,
                  }"
                  :style="{ width: `${Math.min(100, ((d.rajadaMax ?? 0) / 130) * 100)}%` }"
                ></span>
              </span>
              <span class="valor">{{ graus(d.rajadaMax) }}</span>
            </li>
          </ol>
          <p class="nota">
            Rajadas máximas por dia (km/h). Força de tempestade a partir de {{ LIMIARES.rajadaForte }} km/h; de ciclone a
            partir de {{ LIMIARES.rajadaCiclone }} km/h.
          </p>
        </CartaoPerigo>

        <!-- SECA -->
        <CartaoPerigo
          v-if="riscos.seca"
          :perigo="{ id: 'seca', ...riscos.seca, nome: 'Seca' }"
          :resumo="`${formatarNumero(riscos.seca.chuva30)} mm de chuva em 30 dias · ${riscos.seca.diasSemChuva === 0 ? 'choveu ontem' : `${riscos.seca.diasSemChuva} ${riscos.seca.diasSemChuva === 1 ? 'dia' : 'dias'} sem chover`}`"
          :aberto="aberto === 'seca'"
          class="entra"
          style="--i: 4"
          @alternar="alternar"
        >
          <div class="numeros">
            <div>
              <span class="n">{{ formatarNumero(riscos.seca.chuva30) }} mm</span><span>chuva em 30 dias</span>
            </div>
            <div>
              <span class="n">{{ formatarNumero(riscos.seca.evaporacao30) }} mm</span><span>água evaporada</span>
            </div>
            <div>
              <span class="n">{{ riscos.seca.diasSemChuva }}</span><span>{{ riscos.seca.diasSemChuva === 1 ? 'dia' : 'dias' }} seguidos sem chuva</span>
            </div>
          </div>
          <div class="balanco">
            <span class="balanco-rotulo">Balanço de água: <strong>{{ formatarNumero(riscos.seca.balanco) }} mm</strong></span>
            <div class="balanco-pista" aria-hidden="true">
              <span class="marcador" :style="{ left: posicaoBalanco }"></span>
            </div>
            <div class="balanco-legenda"><span>Muito seco</span><span>Húmido</span></div>
          </div>
          <p v-if="riscos.seca.epocaSeca" class="nota">Estamos na época seca (Maio a Outubro): chover pouco é normal.</p>
        </CartaoPerigo>

        <!-- COMUNIDADE -->
        <section class="comunidade entra" style="--i: 5" aria-labelledby="t-comunidade">
          <div class="cab-seccao">
            <h2 id="t-comunidade" class="titulo-cartao">Vias e relatos em {{ cidade.nome }}</h2>
            <RouterLink :to="{ name: 'comunidade', query: { cidade: cidade.id } }" class="ver-tudo">
              Ver e relatar ›
            </RouterLink>
          </div>
          <ul v-if="ultimosRelatos.length" class="lista-relatos">
            <CartaoRelato
              v-for="r in ultimosRelatos"
              :key="r.id"
              :relato="r"
              :confirmado="reagidos.has(`confirmar:${r.id}`)"
              :denunciado="reagidos.has(`denunciar:${r.id}`)"
              @confirmar="reagir($event, 'confirmar')"
              @denunciar="reagir($event, 'denunciar')"
            @retirar-denuncia="reagir($event, 'retirar-denuncia')"
            />
          </ul>
          <RouterLink v-else :to="{ name: 'comunidade', query: { cidade: cidade.id } }" class="cartao vazio-relatos">
            Sem relatos nas últimas 72 h. Viu uma via fechada ou alagada? <strong>Avise a comunidade ›</strong>
          </RouterLink>
        </section>

        <p class="actualizado texto-suave">
          Previsão para {{ nomeDoDia(riscos.cheia.dias[0].data).toLowerCase() }} e os 6 dias seguintes · Open-Meteo e GloFAS
        </p>
      </template>
    </EstadoPedido>
  </div>
</template>

<style scoped>
.pagina-cidade {
  max-width: 760px;
  margin: 0 auto;
}
.voltar {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0.25rem 0;
  padding: 0.35rem 0.85rem 0.35rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s ease;
}
.voltar span {
  font-size: 1.3rem;
  line-height: 1;
  transition: transform 0.25s var(--mola);
}
.voltar:hover {
  background: rgba(255, 255, 255, 0.24);
}
.voltar:hover span {
  transform: translateX(-3px);
}
.cabeca {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0.75rem 0 1rem;
}
.cabeca h1 {
  margin: 0;
  font-size: 2rem;
}
.cabeca p {
  margin: 0;
}
.agora {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 1.8rem;
  font-weight: 300;
}

.estado {
  position: relative;
  overflow: hidden;
  margin-bottom: 1.25rem;
  padding: 1.1rem;
}
.estado::before {
  content: '';
  position: absolute;
  inset: -50% -30% auto auto;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--cor-n) 0%, transparent 65%);
  opacity: 0.35;
  pointer-events: none;
}
.nivel-0 {
  --cor-n: var(--risco-baixo);
}
.nivel-1 {
  --cor-n: var(--risco-moderado);
}
.nivel-2 {
  --cor-n: var(--risco-alto);
}
.nivel-3 {
  --cor-n: var(--risco-muito-alto);
}
.estado-topo {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.rotulo {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--texto-fraco);
}
.estado h2 {
  margin: 0.1rem 0 0.45rem;
  font-size: 1.35rem;
}
.conselho {
  position: relative;
  margin: 1rem 0;
  font-size: 1rem;
  line-height: 1.5;
}
.accoes {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.seccao {
  margin-top: 0.5rem;
}
.pagina-cidade :deep(.perigo) {
  margin-bottom: 0.6rem;
}
.dia-escolhido {
  margin: 0.6rem 0 0;
  font-size: 0.88rem;
  animation: aparecer 0.25s var(--suave);
}
.dia-escolhido strong::first-letter {
  text-transform: uppercase;
}
.rio {
  margin-top: 0.85rem;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: none;
}
.nota {
  margin: 0.7rem 0 0;
  font-size: 0.85rem;
  color: var(--texto-suave);
}

.barras-vento {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.35rem;
}
.barras-vento li {
  display: grid;
  grid-template-columns: 2.6rem 1fr 2.2rem;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}
.barras-vento .dia {
  text-transform: capitalize;
  color: var(--texto-suave);
}
.barras-vento .pista {
  height: 10px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
.barras-vento .barra {
  display: block;
  height: 100%;
  border-radius: 5px;
  background: var(--risco-baixo);
  animation: encher 0.8s var(--suave) both;
  transform-origin: left;
}
.barras-vento .barra.media {
  background: var(--risco-moderado);
}
.barras-vento .barra.forte {
  background: var(--risco-alto);
}
@keyframes encher {
  from {
    transform: scaleX(0);
  }
}
.barras-vento .valor {
  text-align: right;
  font-weight: 600;
}

.numeros {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.9rem;
}
.numeros div {
  display: flex;
  flex-direction: column;
  padding: 0.6rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.75rem;
  color: var(--texto-suave);
}
.numeros .n {
  font-size: 1.15rem;
  font-weight: 650;
  color: #fff;
}
.balanco-rotulo {
  font-size: 0.88rem;
}
.balanco-pista {
  position: relative;
  height: 10px;
  margin: 0.45rem 0 0.25rem;
  border-radius: 5px;
  background: linear-gradient(90deg, #c2410c, #f59e0b 35%, #a3e635 55%, #38bdf8);
}
.marcador {
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid rgba(0, 0, 0, 0.35);
  transform: translate(-50%, -50%);
  transition: left 0.8s var(--suave);
}
.balanco-legenda {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--texto-fraco);
}

.comunidade {
  margin-top: 1.25rem;
}
.cab-seccao {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}
.ver-tudo {
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}
.lista-relatos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}
.vazio-relatos {
  display: block;
  text-decoration: none;
  font-size: 0.9rem;
  color: var(--texto-suave);
  transition: background 0.2s ease;
}
.vazio-relatos strong {
  color: #fff;
}
.vazio-relatos:hover {
  background: rgba(255, 255, 255, 0.18);
}
.actualizado {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.78rem;
}
@media (max-width: 400px) {
  .accoes {
    grid-template-columns: 1fr;
  }
  .numeros {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
