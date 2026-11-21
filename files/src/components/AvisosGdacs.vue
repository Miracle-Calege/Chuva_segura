<script setup>
import { computed } from 'vue'
import IconePerigo from './IconePerigo.vue'
import IndicadorRisco from './IndicadorRisco.vue'
import { corNivel } from '../utils/risco'

// Avisos internacionais do GDACS para Moçambique: activos em destaque, recentes numa lista.
const props = defineProps({
  activos: { type: Array, required: true },
  recentes: { type: Array, default: () => [] },
  actualizadoEm: { type: String, default: '' },
})

const perigoDe = (tipo) => ({ TC: 'vento', FL: 'cheia', DR: 'seca' })[tipo] ?? 'ok'
const data = (iso) =>
  iso ? new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : ''
const actualizado = computed(() =>
  props.actualizadoEm
    ? new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Maputo' }).format(
        new Date(props.actualizadoEm),
      )
    : '',
)
</script>

<template>
  <section class="avisos" aria-labelledby="t-avisos">
    <h2 id="t-avisos" class="titulo-cartao">Avisos internacionais (GDACS)</h2>

    <div v-if="activos.length" class="activos">
      <a
        v-for="(e, i) in activos"
        :key="e.id"
        :href="e.relatorio"
        target="_blank"
        rel="noopener"
        class="cartao activo entra"
        :class="`nivel-${e.nivelApp}`"
        :style="{ '--i': i }"
      >
        <IconePerigo :perigo="perigoDe(e.tipo)" :tamanho="52" :cor="corNivel(e.nivelApp)" />
        <span class="texto">
          <strong>{{ e.titulo }}</strong>
          <span>{{ e.paises }} · desde {{ data(e.inicio) }}</span>
          <span v-if="e.ventoMax">Vento máximo {{ e.ventoMax }} km/h</span>
        </span>
        <IndicadorRisco :nivel="e.nivelApp" tamanho="pequeno" prefixo="Alerta" />
      </a>
    </div>
    <div v-else class="cartao sem-avisos entra">
      <IconePerigo perigo="ok" :tamanho="40" cor="var(--risco-baixo)" />
      <span>
        <strong>Sem avisos activos para Moçambique</strong>
        <span v-if="actualizado" class="texto-suave">Verificado em {{ actualizado }}</span>
      </span>
    </div>

    <details v-if="recentes.length" class="recentes">
      <summary>Eventos dos últimos 12 meses</summary>
      <ul>
        <li v-for="e in recentes" :key="e.id">
          <IconePerigo :perigo="perigoDe(e.tipo)" :tamanho="26" :cor="corNivel(e.nivelApp)" />
          <a :href="e.relatorio" target="_blank" rel="noopener">{{ e.titulo }}</a>
          <span class="texto-suave">{{ data(e.inicio) }}</span>
        </li>
      </ul>
    </details>
  </section>
</template>

<style scoped>
.activos {
  display: grid;
  gap: 0.6rem;
}
.activo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  text-decoration: none;
  color: #fff;
  border-left: 4px solid var(--cor-n);
  transition: transform 0.3s var(--mola);
}
.activo:hover {
  transform: translateY(-2px);
}
.nivel-0 {
  --cor-n: var(--risco-baixo);
}
.nivel-2 {
  --cor-n: var(--risco-alto);
}
.nivel-3 {
  --cor-n: var(--risco-muito-alto);
}
.texto {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}
.texto strong {
  font-size: 1rem;
}
.sem-avisos {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}
.sem-avisos > span {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}
.sem-avisos strong {
  font-size: 0.95rem;
}
.recentes {
  margin-top: 0.5rem;
  font-size: 0.88rem;
}
.recentes summary {
  cursor: pointer;
  color: var(--texto-suave);
  padding: 0.3rem 0;
}
.recentes ul {
  list-style: none;
  margin: 0.3rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.4rem;
  animation: aparecer 0.3s var(--suave);
}
.recentes li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.recentes li a {
  flex: 1;
}
</style>
