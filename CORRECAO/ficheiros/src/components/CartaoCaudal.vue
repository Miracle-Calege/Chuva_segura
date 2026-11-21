<script setup>
import { computed } from 'vue'
import { formatarNumero } from '../utils/tempo'

// Caudal do rio mais próximo (modelo GloFAS): mini-gráfico dos últimos 30 dias + próximos 7.
const props = defineProps({
  serie: { type: Object, default: null }, // { passado: [{data, valor}], futuro: [...] }
  avaliacao: { type: Object, default: null }, // resultado de avaliarCaudal()
  aviso: { type: String, default: '' },
})

const LARGURA = 300
const ALTURA = 70

const linhas = computed(() => {
  if (!props.serie) return null
  const todos = [...props.serie.passado, ...props.serie.futuro]
  if (todos.length < 2) return null
  const max = Math.max(...todos.map((p) => p.valor)) || 1
  const passo = LARGURA / (todos.length - 1)
  const ponto = (p, i) => `${(i * passo).toFixed(1)},${(ALTURA - 4 - (p.valor / max) * (ALTURA - 10)).toFixed(1)}`
  const pontos = todos.map(ponto)
  const n = props.serie.passado.length
  return {
    passado: pontos.slice(0, n + 1).join(' '),
    futuro: pontos.slice(Math.max(0, n - 1)).join(' '),
    area: `0,${ALTURA} ${pontos.join(' ')} ${LARGURA},${ALTURA}`,
    hoje: n * passo,
  }
})

const valor = computed(() => {
  const a = props.avaliacao
  if (!a) return '—'
  return `${formatarNumero(a.maximoPrevisto)} m³/s`
})

const descricao = computed(() => {
  const a = props.avaliacao
  if (!a) return props.aviso || 'Sem dados de caudal para este local.'
  if (!a.relevante) return 'Curso de água pequeno — não entra no cálculo do risco.'
  if (a.subidaForte) return `Pode passar o dobro do normal (${formatarNumero(a.medianaPassado)} m³/s). Evite margens e travessias.`
  return `Tendência ${a.tendencia}. Normal recente: ${formatarNumero(a.medianaPassado)} m³/s.`
})
</script>

<template>
  <section class="cartao caudal" :class="{ alerta: avaliacao?.subidaForte }">
    <h3 class="titulo-cartao">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          d="M2 9c3-2 5-2 8 0s5 2 8 0 3-1 4-1M2 15c3-2 5-2 8 0s5 2 8 0 3-1 4-1"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      Rio mais próximo · máx. previsto
    </h3>
    <p class="valor">{{ valor }}</p>
    <svg v-if="linhas" class="mini" :viewBox="`0 0 ${LARGURA} ${ALTURA}`" preserveAspectRatio="none" aria-hidden="true">
      <polygon :points="linhas.area" fill="rgba(143, 211, 255, 0.15)" />
      <polyline :points="linhas.passado" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="2" />
      <polyline :points="linhas.futuro" fill="none" stroke="#8fd3ff" stroke-width="2.5" stroke-dasharray="5 3" />
      <line :x1="linhas.hoje" :x2="linhas.hoje" y1="0" :y2="ALTURA" stroke="rgba(255,255,255,0.4)" stroke-dasharray="2 3" />
    </svg>
    <p class="detalhe">{{ descricao }}</p>
  </section>
</template>

<style scoped>
.caudal.alerta {
  border-color: color-mix(in srgb, var(--risco-alto) 60%, transparent);
}
.valor {
  margin: 0;
  font-size: 1.9rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}
.mini {
  display: block;
  width: 100%;
  height: 64px;
  margin: 0.4rem 0;
}
.detalhe {
  margin: 0;
  font-size: 0.85rem;
  color: var(--texto-suave);
}
</style>
