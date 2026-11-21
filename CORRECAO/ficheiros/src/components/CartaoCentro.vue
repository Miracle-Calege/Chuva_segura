<script setup>
import { computed } from 'vue'
import { formatarDistancia, ligacaoDireccoes, ligacaoPesquisaMapa, nomeProvincia } from '../utils/geo'

// Um centro de acomodação usado em emergências anteriores, com a fonte da informação.
const props = defineProps({
  centro: { type: Object, required: true },
  posicao: { type: Number, default: 0 },
  mostrarProvincia: { type: Boolean, default: false },
})

const ICONES = { escola: '🏫', centro: '⛺', edificio: '🏢', varios: '🏘️' }

const exacto = computed(() => props.centro.precisao === 'local')
const ligacao = computed(() =>
  exacto.value ? ligacaoDireccoes(props.centro) : ligacaoPesquisaMapa(props.centro.nome, props.centro.local),
)
</script>

<template>
  <li class="cartao centro entra" :style="{ '--i': posicao }">
    <div class="topo">
      <span class="icone" aria-hidden="true">{{ ICONES[centro.tipo] ?? '📍' }}</span>
      <div class="info">
        <strong class="nome">{{ centro.nome }}</strong>
        <span class="local">
          {{ centro.local }}<template v-if="mostrarProvincia"> · {{ nomeProvincia(centro.provincia) }}</template>
        </span>
        <span v-if="centro.distanciaKm !== null" class="distancia">
          <template v-if="exacto">{{ formatarDistancia(centro.distanciaKm) }}</template>
          <template v-else-if="centro.distanciaKm < 3">Na sua zona — veja o local exacto no mapa</template>
          <template v-else>≈ {{ formatarDistancia(centro.distanciaKm) }} (localização aproximada)</template>
        </span>
      </div>
      <a :href="ligacao" target="_blank" rel="noopener" class="botao pequeno">{{ exacto ? 'Ir' : 'Mapa' }}</a>
    </div>
    <div class="eventos">
      <span v-for="e in centro.eventos" :key="e" class="evento">{{ e }}</span>
    </div>
    <p v-if="centro.nota" class="nota">⚠️ {{ centro.nota }}</p>
    <a :href="centro.fonte.url" target="_blank" rel="noopener" class="fonte">Fonte: {{ centro.fonte.titulo }}</a>
  </li>
</template>

<style scoped>
.centro {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.85rem 0.9rem;
  transition: transform 0.3s var(--mola);
}
.centro:hover {
  transform: translateY(-2px);
}
.topo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.icone {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 1.4rem;
}
.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.local,
.distancia {
  font-size: 0.82rem;
  color: var(--texto-suave);
}
.distancia {
  color: #fff;
  font-weight: 600;
}
.botao.pequeno {
  min-height: 38px;
  padding: 0.4rem 0.9rem;
  font-size: 0.88rem;
}
.eventos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.evento {
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: rgba(124, 200, 255, 0.2);
  border: 1px solid rgba(124, 200, 255, 0.45);
  font-size: 0.72rem;
  font-weight: 600;
}
.nota {
  margin: 0;
  font-size: 0.82rem;
  padding: 0.4rem 0.6rem;
  border-radius: 10px;
  background: rgba(250, 204, 21, 0.16);
}
.fonte {
  font-size: 0.75rem;
  color: var(--texto-fraco);
}
</style>
