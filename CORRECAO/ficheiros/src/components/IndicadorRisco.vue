<script setup>
import { computed } from 'vue'
import { infoNivel } from '../utils/risco'

// Pastilha com o nível de risco (0 = baixo … 3 = muito alto).
const props = defineProps({
  nivel: { type: Number, required: true },
  tamanho: { type: String, default: 'normal', validator: (v) => ['pequeno', 'normal', 'grande'].includes(v) },
  prefixo: { type: String, default: 'Risco' },
})

const info = computed(() => infoNivel(props.nivel))
</script>

<template>
  <span class="indicador" :class="[`risco-${info.id}`, tamanho]">
    <span class="ponto" aria-hidden="true"></span>
    {{ prefixo ? `${prefixo} ${info.rotulo.toLowerCase()}` : info.rotulo }}
  </span>
</template>

<style scoped>
.indicador {
  --cor: var(--risco-baixo);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--cor) 24%, transparent);
  border: 1px solid color-mix(in srgb, var(--cor) 55%, transparent);
  color: #fff;
  font-weight: 650;
  font-size: 0.82rem;
  white-space: nowrap;
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
.ponto {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cor);
}
/* o ponto "pulsa" nos níveis alto e muito alto */
.risco-alto .ponto,
.risco-muito-alto .ponto {
  animation: alerta 1.8s ease-out infinite;
}
@keyframes alerta {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--cor) 70%, transparent);
  }
  100% {
    box-shadow: 0 0 0 8px transparent;
  }
}
.pequeno {
  font-size: 0.72rem;
  padding: 0.1rem 0.5rem;
}
.grande {
  font-size: 1rem;
  padding: 0.35rem 0.9rem;
}
.grande .ponto {
  width: 10px;
  height: 10px;
}
</style>
