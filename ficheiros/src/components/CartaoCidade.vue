<script setup>
import { computed } from 'vue'
import IndicadorRisco from './IndicadorRisco.vue'
import IconeTempo from './IconeTempo.vue'
import IconePerigo from './IconePerigo.vue'
import { corNivel } from '../utils/risco'
import { graus } from '../utils/tempo'

// Cartão de uma localidade: nível de alerta geral e o nível de cada perigo.
// Ao tocar, avisa o pai com o evento "seleccionar".
const props = defineProps({
  cidade: { type: Object, required: true },
  risco: { type: Object, default: null }, // resultado de avaliarRiscos()
  actual: { type: Object, default: null },
})

const emit = defineEmits(['seleccionar'])

const detalhe = computed(() => [props.cidade.provincia, props.cidade.distrito].filter(Boolean).join(' · ') || 'Moçambique')
</script>

<template>
  <button type="button" class="cartao cartao-cidade" :class="risco ? `nivel-${risco.nivel}` : ''" @click="emit('seleccionar', cidade)">
    <span class="linha">
      <span class="nome">{{ cidade.nome }}</span>
      <span v-if="actual" class="tempo">
        <IconeTempo :codigo="actual.codigoTempo" :e-dia="actual.eDia" :tamanho="26" />
        {{ graus(actual.temperatura) }}°
      </span>
      <span v-else class="seta" aria-hidden="true">›</span>
    </span>
    <span class="detalhe">{{ detalhe }}</span>

    <span v-if="risco" class="linha fundo">
      <IndicadorRisco :nivel="risco.nivel" tamanho="pequeno" :prefixo="risco.nivel > 0 ? risco.principal.nome : 'Risco'" />
      <span class="perigos">
        <span v-for="p in risco.lista" :key="p.id" class="mini" :title="`${p.nome}: nível ${p.nivel}`">
          <IconePerigo :perigo="p.id" :tamanho="22" :cor="corNivel(p.nivel)" :animado="p.nivel >= 2" />
        </span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.cartao-cidade {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  width: 100%;
  min-height: 92px;
  text-align: left;
  font: inherit;
  color: #fff;
  cursor: pointer;
  border-left: 4px solid transparent;
  transition:
    transform 0.3s var(--mola),
    background 0.25s ease,
    box-shadow 0.25s ease;
}
.nivel-1 {
  border-left-color: var(--risco-moderado);
}
.nivel-2 {
  border-left-color: var(--risco-alto);
}
.nivel-3 {
  border-left-color: var(--risco-muito-alto);
}
.cartao-cidade:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 14px 30px rgba(0, 20, 50, 0.22);
}
.cartao-cidade:active {
  transform: scale(0.97);
  transition-duration: 0.1s;
}
.linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.fundo {
  margin-top: auto;
  padding-top: 0.45rem;
}
.nome {
  font-weight: 700;
  font-size: 1.15rem;
}
.tempo {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 1.05rem;
  font-weight: 500;
}
.detalhe {
  font-size: 0.82rem;
  color: var(--texto-suave);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.perigos {
  display: flex;
  gap: 0.2rem;
}
.mini {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
}
.seta {
  font-size: 1.6rem;
  color: var(--texto-fraco);
  transition: transform 0.25s var(--mola);
}
.cartao-cidade:hover .seta {
  transform: translateX(4px);
}
</style>
