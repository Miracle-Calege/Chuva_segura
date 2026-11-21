<script setup>
import { useId } from 'vue'
// Ícones animados dos perigos: cheia, ciclone/vento, seca e "sem perigo" (SVG + CSS).
defineProps({
  perigo: { type: String, required: true, validator: (v) => ['cheia', 'vento', 'seca', 'ok'].includes(v) },
  tamanho: { type: Number, default: 48 },
  cor: { type: String, default: '' }, // cor do nível de risco (opcional)
  animado: { type: Boolean, default: true },
})

const uid = useId()
</script>

<template>
  <svg
    class="icone-perigo"
    :class="[`perigo-${perigo}`, { parado: !animado }]"
    :width="tamanho"
    :height="tamanho"
    viewBox="0 0 64 64"
    aria-hidden="true"
    :style="cor ? { '--cor': cor } : undefined"
  >
    <!-- CHEIA: casa com a água a subir e a descer -->
    <template v-if="perigo === 'cheia'">
      <defs>
        <clipPath :id="`corte-${uid}`"><rect x="0" y="0" width="64" height="64" rx="14" /></clipPath>
      </defs>
      <path class="casa" d="M14 34l18-15 18 15v16H14z" />
      <path class="telhado" d="M10 35l22-19 22 19" />
      <rect class="porta" x="28" y="38" width="8" height="12" rx="1" />
      <g :clip-path="`url(#corte-${uid})`"><g class="agua">
        <path class="onda o1" d="M-8 46c5-4 9-4 14 0s9 4 14 0 9-4 14 0 9 4 14 0 9-4 14 0 9 4 14 0v20H-8z" />
        <path class="onda o2" d="M-8 51c5-4 9-4 14 0s9 4 14 0 9-4 14 0 9 4 14 0 9-4 14 0 9 4 14 0v20H-8z" />
      </g></g>
    </template>

    <!-- CICLONE: espiral a rodar -->
    <template v-else-if="perigo === 'vento'">
      <g class="espiral">
        <path d="M32 32c0-9 7-15 16-14-4-3-9-5-14-4C24 16 18 25 20 34" />
        <path d="M32 32c0 9-7 15-16 14 4 3 9 5 14 4 10-2 16-11 14-20" />
        <circle cx="32" cy="32" r="4.5" class="olho" />
      </g>
      <path class="rajada r1" d="M6 18h12" />
      <path class="rajada r2" d="M46 50h12" />
    </template>

    <!-- SECA: sol forte e terra rachada -->
    <template v-else-if="perigo === 'seca'">
      <g class="sol">
        <circle cx="32" cy="22" r="9" />
        <g class="raios">
          <line v-for="n in 8" :key="n" x1="32" y1="6" x2="32" y2="9" :transform="`rotate(${n * 45} 32 22)`" />
        </g>
      </g>
      <path class="calor c1" d="M14 38c2-2 2-4 0-6M24 38c2-2 2-4 0-6" />
      <path class="calor c2" d="M40 38c2-2 2-4 0-6M50 38c2-2 2-4 0-6" />
      <path class="terra" d="M6 46h52v10H6z" />
      <path class="racha" d="M16 46l3 4-2 6M32 46l-2 5 3 5M46 46l3 3-1 7" />
    </template>

    <!-- OK: escudo com visto -->
    <template v-else>
      <path class="escudo" d="M32 8l20 7v14c0 13-8 22-20 27C20 51 12 42 12 29V15z" />
      <path class="visto" d="M23 32l6 6 12-13" />
    </template>
  </svg>
</template>

<style scoped>
.icone-perigo {
  --cor: #8fd3ff;
  display: inline-block;
  flex-shrink: 0;
  overflow: visible;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
}
.icone-perigo * {
  transform-box: fill-box;
  transform-origin: center;
}

/* Cheia */
.casa {
  fill: rgba(255, 255, 255, 0.92);
}
.telhado {
  fill: none;
  stroke: #fff;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.porta {
  fill: #6b8299;
}
.onda {
  fill: var(--cor);
}
.o1 {
  opacity: 0.55;
  animation: ondular 2.6s ease-in-out infinite;
}
.o2 {
  opacity: 0.9;
  animation: ondular 2.6s ease-in-out infinite reverse;
}
.agua {
  animation: subirAgua 4s ease-in-out infinite;
}
@keyframes ondular {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-14px);
  }
}
@keyframes subirAgua {
  0%,
  100% {
    transform: translateY(2px);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Ciclone */
.espiral {
  transform-box: view-box;
  transform-origin: 32px 32px;
  animation: girar 2.4s linear infinite;
}
.espiral path {
  fill: var(--cor);
}
.olho {
  fill: rgba(255, 255, 255, 0.95);
}
.rajada {
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 3;
  stroke-linecap: round;
  animation: rajada 1.4s ease-in-out infinite;
}
.r2 {
  animation-delay: 0.7s;
}
@keyframes girar {
  to {
    transform: rotate(-360deg);
  }
}
@keyframes rajada {
  0% {
    transform: translateX(-6px);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(6px);
    opacity: 0;
  }
}

/* Seca */
.sol circle {
  fill: #ffb627;
}
.raios {
  transform-box: view-box;
  transform-origin: 32px 22px;
  animation: girar 10s linear infinite reverse;
}
.raios line {
  /* a rotação de cada raio é em torno do centro do sol (atributo transform), não do próprio raio */
  transform-box: view-box;
  transform-origin: 0 0;
  stroke: #ffd23f;
  stroke-width: 3;
  stroke-linecap: round;
}
.calor {
  fill: none;
  stroke: rgba(255, 255, 255, 0.7);
  stroke-width: 2;
  stroke-linecap: round;
  animation: tremer 1.6s ease-in-out infinite;
}
.c2 {
  animation-delay: 0.8s;
}
.terra {
  fill: var(--cor, #c98a4b);
}
.perigo-seca {
  --cor: #c98a4b;
}
.racha {
  fill: none;
  stroke: #5a3a1c;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
@keyframes tremer {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

/* OK */
.escudo {
  fill: color-mix(in srgb, var(--cor) 35%, transparent);
  stroke: var(--cor);
  stroke-width: 3;
  stroke-linejoin: round;
}
.visto {
  fill: none;
  stroke: #fff;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: tracar 0.8s 0.2s ease forwards;
}
@keyframes tracar {
  to {
    stroke-dashoffset: 0;
  }
}
/* versão parada (ícones pequenos repetidos em listas) */
.parado * {
  animation: none !important;
}
.parado .visto {
  stroke-dashoffset: 0;
}
@media (prefers-reduced-motion: reduce) {
  .visto {
    stroke-dashoffset: 0;
  }
}
</style>
