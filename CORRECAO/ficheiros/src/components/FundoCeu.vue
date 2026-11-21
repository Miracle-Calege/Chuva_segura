<script setup>
import { computed } from 'vue'

// Fundo da aplicação: um gradiente por tipo de céu, com transição suave entre eles,
// e chuva animada quando está a chover.
const props = defineProps({ ceu: { type: String, required: true } })

const CEUS = ['limpo', 'nublado', 'chuva', 'trovoada', 'noite']
const aChover = computed(() => props.ceu === 'chuva' || props.ceu === 'trovoada')

// posições "aleatórias" fixas para as gotas (iguais em todos os carregamentos)
const gotas = Array.from({ length: 36 }, (_, i) => ({
  esquerda: (i * 37) % 100,
  atraso: ((i * 53) % 100) / 100,
  duracao: 0.55 + ((i * 29) % 40) / 100,
  opacidade: 0.25 + ((i * 17) % 50) / 100,
}))
</script>

<template>
  <div class="fundo" aria-hidden="true">
    <div v-for="c in CEUS" :key="c" class="camada" :class="[`ceu-${c}`, { visivel: c === ceu }]"></div>
    <Transition name="chuva">
      <div v-if="aChover" class="chuva">
        <span
          v-for="(g, i) in gotas"
          :key="i"
          :style="{
            left: `${g.esquerda}%`,
            animationDelay: `${g.atraso}s`,
            animationDuration: `${g.duracao}s`,
            opacity: g.opacidade,
          }"
        ></span>
      </div>
    </Transition>
    <div v-if="ceu === 'trovoada'" class="clarao"></div>
  </div>
</template>

<style scoped>
.fundo {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: #1b4f7a;
}
.camada {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.2s ease;
}
.camada.visivel {
  opacity: 1;
}
.ceu-limpo {
  background: linear-gradient(180deg, #2a7bd1 0%, #4a9be6 45%, #87c3f2 100%);
}
.ceu-nublado {
  background: linear-gradient(180deg, #51667e 0%, #7489a1 50%, #9fb0c2 100%);
}
.ceu-chuva {
  background: linear-gradient(180deg, #2c3a4c 0%, #43566c 55%, #5f7287 100%);
}
.ceu-trovoada {
  background: linear-gradient(180deg, #1c1830 0%, #2e2a4a 50%, #4a4565 100%);
}
.ceu-noite {
  background: linear-gradient(180deg, #0a1330 0%, #142352 55%, #2a3d73 100%);
}
.chuva span {
  position: absolute;
  top: -12vh;
  width: 1.5px;
  height: 11vh;
  background: linear-gradient(to bottom, transparent, rgba(200, 225, 255, 0.85));
  animation: cair linear infinite;
}
@keyframes cair {
  to {
    transform: translateY(125vh);
  }
}
.chuva-enter-active,
.chuva-leave-active {
  transition: opacity 1s ease;
}
.chuva-enter-from,
.chuva-leave-to {
  opacity: 0;
}
.clarao {
  position: absolute;
  inset: 0;
  background: #fff;
  opacity: 0;
  animation: clarao 7s infinite;
}
@keyframes clarao {
  0%,
  88%,
  92%,
  100% {
    opacity: 0;
  }
  89%,
  91% {
    opacity: 0.18;
  }
}
@media (prefers-reduced-motion: reduce) {
  .chuva,
  .clarao {
    display: none;
  }
}
</style>
