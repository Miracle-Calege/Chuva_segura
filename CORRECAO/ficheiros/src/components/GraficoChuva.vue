<script setup>
import { computed } from 'vue'
import { LIMIARES, infoNivel } from '../utils/risco'
import { nomeDoDiaAbreviado, nomeDoDia, formatarNumero } from '../utils/tempo'

// Gráfico de barras da chuva prevista por dia (só HTML e CSS, sem bibliotecas).
const props = defineProps({
  dias: { type: Array, required: true },
  dataSeleccionada: { type: String, default: '' },
})

const emit = defineEmits(['seleccionar-dia'])

// A escala vai pelo menos até ao limiar "alto", para que 5 mm não pareçam uma tempestade.
const maximo = computed(() => Math.max(LIMIARES.chuvaForte * 1.2, ...props.dias.map((d) => d.chuva ?? 0)))
const posicaoLimiar = computed(() => (LIMIARES.chuvaForte / maximo.value) * 100)

function altura(dia) {
  return Math.max(2, ((dia.chuva ?? 0) / maximo.value) * 100)
}
</script>

<template>
  <figure class="grafico">
    <div class="area">
      <button
        v-for="(dia, i) in dias"
        :key="dia.data"
        type="button"
        class="coluna"
        :class="[`risco-${infoNivel(dia.nivelChuva ?? 0).id}`, { activa: dia.data === dataSeleccionada }]"
        :aria-label="`${nomeDoDia(dia.data)}: ${formatarNumero(dia.chuva)} milímetros`"
        :aria-pressed="dia.data === dataSeleccionada"
        @click="emit('seleccionar-dia', dia.data)"
      >
        <span class="valor">{{ formatarNumero(dia.chuva) }}</span>
        <span class="pista">
          <span class="limiar" :style="{ bottom: `${posicaoLimiar}%` }" aria-hidden="true"></span>
          <span class="barra" :style="{ height: `${altura(dia)}%`, animationDelay: `${i * 60}ms` }"></span>
        </span>
        <span class="rotulo">{{ nomeDoDiaAbreviado(dia.data) }}</span>
      </button>
    </div>
    <figcaption class="visualmente-oculto">Chuva prevista por dia, em milímetros</figcaption>
  </figure>
</template>

<style scoped>
.grafico {
  margin: 0;
}
.area {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  height: 170px;
}
.coluna {
  --cor: var(--risco-baixo);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  height: 100%;
  padding: 0 1px;
  border: 0;
  border-radius: 12px;
  background: none;
  font: inherit;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease;
}
.coluna:hover {
  background: rgba(255, 255, 255, 0.06);
}
.coluna.activa {
  background: rgba(255, 255, 255, 0.14);
}
.risco-moderado {
  --cor: var(--risco-moderado);
}
.risco-alto {
  --cor: var(--risco-alto);
}
.risco-muito-alto {
  --cor: var(--risco-muito-alto);
}
.pista {
  position: relative;
  flex: 1;
  width: 100%;
}
.limiar {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1.5px dashed rgba(255, 255, 255, 0.35);
}
.barra {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 56%;
  max-width: 34px;
  background: linear-gradient(to top, color-mix(in srgb, var(--cor) 70%, transparent), var(--cor));
  border-radius: 8px 8px 4px 4px;
  transform: translateX(-50%) scaleY(1);
  transform-origin: bottom;
  animation: crescer 0.7s var(--suave) both;
}
@keyframes crescer {
  from {
    transform: translateX(-50%) scaleY(0);
  }
}
.coluna:hover .barra {
  filter: brightness(1.15);
}
.valor {
  font-size: 0.75rem;
  font-weight: 700;
}
.rotulo {
  font-size: 0.75rem;
  color: var(--texto-suave);
  text-transform: capitalize;
}
.activa .rotulo {
  color: #fff;
  font-weight: 700;
}
</style>
