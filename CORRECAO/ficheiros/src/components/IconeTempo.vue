<script setup>
import { computed, useId } from 'vue'
import { tipoTempo } from '../utils/tempo'

// Ícone animado do estado do tempo (SVG + CSS, sem imagens a descarregar).
const props = defineProps({
  codigo: { type: Number, default: null },
  eDia: { type: Boolean, default: true },
  tamanho: { type: Number, default: 48 },
  rotulo: { type: String, default: '' },
})

const id = useId()
const tipo = computed(() => tipoTempo(props.codigo))
const temSol = computed(() => props.eDia && (tipo.value === 'sol' || tipo.value === 'sol-nuvem'))
const temLua = computed(() => !props.eDia && (tipo.value === 'sol' || tipo.value === 'sol-nuvem'))
const temNuvem = computed(() => tipo.value !== 'sol')
const nuvemEscura = computed(() => ['chuva', 'trovoada'].includes(tipo.value))
const gotas = computed(() => ({ chuvisco: 3, chuva: 5, trovoada: 3 })[tipo.value] ?? 0)
// a nuvem fica mais pequena e para o lado quando há sol/lua por trás
const nuvemParcial = computed(() => tipo.value === 'sol-nuvem')
</script>

<template>
  <svg
    class="icone-tempo"
    :class="`tipo-${tipo}`"
    :width="tamanho"
    :height="tamanho"
    viewBox="0 0 64 64"
    :role="rotulo ? 'img' : undefined"
    :aria-label="rotulo || undefined"
    :aria-hidden="rotulo ? undefined : 'true'"
  >
    <defs>
      <radialGradient :id="`${id}-sol`" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff6c4" />
        <stop offset="55%" stop-color="#ffd23f" />
        <stop offset="100%" stop-color="#ffa41b" />
      </radialGradient>
      <linearGradient :id="`${id}-nuvem`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#d7e3ee" />
      </linearGradient>
      <linearGradient :id="`${id}-escura`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c9d3df" />
        <stop offset="100%" stop-color="#8795a8" />
      </linearGradient>
    </defs>

    <!-- Sol -->
    <g v-if="temSol" class="sol" :transform="nuvemParcial ? 'translate(-8 -8)' : ''">
      <g class="raios">
        <line v-for="n in 8" :key="n" x1="32" y1="9" x2="32" y2="15" :transform="`rotate(${n * 45} 32 32)`" />
      </g>
      <circle class="nucleo" cx="32" cy="32" r="11" :fill="`url(#${id}-sol)`" />
    </g>

    <!-- Lua -->
    <g v-if="temLua" class="lua" :transform="nuvemParcial ? 'translate(-7 -8)' : ''">
      <path d="M38 14a18 18 0 1 0 12 30A15 15 0 0 1 38 14z" fill="#f4f1d0" />
      <circle class="estrela e1" cx="49" cy="16" r="1.3" fill="#fff" />
      <circle class="estrela e2" cx="54" cy="25" r="1" fill="#fff" />
    </g>

    <!-- Nuvem -->
    <g
      v-if="temNuvem"
      class="nuvem"
      :transform="nuvemParcial ? 'translate(7 9) scale(0.8)' : tipo === 'nuvens' || tipo === 'nevoeiro' ? 'translate(0 4)' : ''"
    >
      <g v-if="tipo === 'nuvens'" class="nuvem-tras" opacity="0.7">
        <circle cx="44" cy="22" r="8" :fill="`url(#${id}-escura)`" />
        <circle cx="52" cy="27" r="6" :fill="`url(#${id}-escura)`" />
      </g>
      <g :fill="nuvemEscura ? `url(#${id}-escura)` : `url(#${id}-nuvem)`">
        <circle cx="23" cy="33" r="9" />
        <circle cx="34" cy="27" r="12" />
        <circle cx="45" cy="34" r="8" />
        <rect x="14" y="33" width="38" height="10" rx="5" />
      </g>
    </g>

    <!-- Gotas de chuva -->
    <g v-if="gotas" class="gotas">
      <line
        v-for="n in gotas"
        :key="n"
        class="gota"
        :x1="16 + n * (32 / (gotas + 1))"
        y1="47"
        :x2="14 + n * (32 / (gotas + 1))"
        y2="53"
        :style="{ animationDelay: `${(n * 0.27) % 1}s` }"
      />
    </g>

    <!-- Relâmpago -->
    <path v-if="tipo === 'trovoada'" class="raio" d="M34 40l-7 11h6l-3 9 9-13h-6l4-7z" />

    <!-- Neve -->
    <g v-if="tipo === 'neve'" class="flocos">
      <circle v-for="n in 4" :key="n" class="floco" :cx="18 + n * 7" cy="50" r="1.8" :style="{ animationDelay: `${n * 0.4}s` }" />
    </g>

    <!-- Nevoeiro -->
    <g v-if="tipo === 'nevoeiro'" class="nevoeiro">
      <line x1="12" y1="50" x2="44" y2="50" />
      <line class="n2" x1="20" y1="56" x2="54" y2="56" />
    </g>
  </svg>
</template>

<style scoped>
.icone-tempo {
  display: inline-block;
  overflow: visible;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.18));
}
.raios line {
  stroke: #ffc93c;
  stroke-width: 3;
  stroke-linecap: round;
}
.raios,
.lua,
.nuvem,
.nuvem-tras,
.raio,
.gota,
.floco,
.nevoeiro line {
  transform-box: fill-box;
  transform-origin: center;
}
.raios {
  transform-box: view-box;
  transform-origin: 32px 32px;
  animation: girar 14s linear infinite;
}
.nucleo {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulsar 3.5s ease-in-out infinite;
}
.lua {
  animation: flutuar 6s ease-in-out infinite;
}
.estrela {
  animation: cintilar 2.4s ease-in-out infinite;
}
.estrela.e2 {
  animation-delay: 1.1s;
}
.nuvem > g:last-child {
  animation: derivar 7s ease-in-out infinite alternate;
}
.nuvem-tras {
  animation: derivar 9s ease-in-out infinite alternate-reverse;
}
.gota {
  stroke: #7cc8ff;
  stroke-width: 2.6;
  stroke-linecap: round;
  animation: cair 1s linear infinite;
}
.tipo-chuvisco .gota {
  stroke-width: 2;
  animation-duration: 1.3s;
}
.raio {
  fill: #ffd23f;
  animation: relampejar 3s ease-in-out infinite;
}
.floco {
  fill: #fff;
  animation: nevar 2.4s linear infinite;
}
.nevoeiro line {
  stroke: #e6edf3;
  stroke-width: 3;
  stroke-linecap: round;
  animation: deslizar 4s ease-in-out infinite alternate;
}
.nevoeiro .n2 {
  animation-direction: alternate-reverse;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
@keyframes pulsar {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}
@keyframes flutuar {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-1.5px);
  }
}
@keyframes cintilar {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}
@keyframes derivar {
  from {
    transform: translateX(-1.5px);
  }
  to {
    transform: translateX(1.5px);
  }
}
@keyframes cair {
  0% {
    transform: translateY(-4px);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  100% {
    transform: translateY(7px);
    opacity: 0;
  }
}
@keyframes relampejar {
  0%,
  60%,
  72%,
  100% {
    opacity: 0;
  }
  62%,
  70% {
    opacity: 1;
  }
  66% {
    opacity: 0.4;
  }
}
@keyframes nevar {
  0% {
    transform: translateY(-4px);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    transform: translateY(8px);
    opacity: 0;
  }
}
@keyframes deslizar {
  from {
    transform: translateX(-3px);
  }
  to {
    transform: translateX(3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .icone-tempo * {
    animation: none !important;
  }
  .raio {
    opacity: 1;
  }
}
</style>
