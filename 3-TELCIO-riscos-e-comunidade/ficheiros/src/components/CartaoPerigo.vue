<script setup>
import IconePerigo from './IconePerigo.vue'
import IndicadorRisco from './IndicadorRisco.vue'
import { corNivel } from '../utils/risco'

// Cartão de um perigo (cheia, ciclone/vento ou seca) com o nível, o conselho e um resumo.
// O conteúdo de detalhe (gráficos, números) vem pelo slot. Abre/fecha ao tocar no cabeçalho.
defineProps({
  perigo: { type: Object, required: true }, // { id, nome, nivel, conselho }
  resumo: { type: String, default: '' },
  aberto: { type: Boolean, default: false },
})

const emit = defineEmits(['alternar'])
</script>

<template>
  <section class="cartao perigo" :class="[`nivel-${perigo.nivel}`, { aberto }]">
    <button type="button" class="topo" :aria-expanded="aberto" @click="emit('alternar', perigo.id)">
      <IconePerigo :perigo="perigo.id" :tamanho="46" :cor="corNivel(perigo.nivel)" />
      <span class="titulo">
        <span class="nome">{{ perigo.nome }}</span>
        <span v-if="resumo" class="resumo">{{ resumo }}</span>
      </span>
      <IndicadorRisco :nivel="perigo.nivel" tamanho="pequeno" prefixo="" />
      <span class="seta" aria-hidden="true">›</span>
    </button>
    <div class="corpo">
      <div class="interior">
        <p class="conselho">{{ perigo.conselho }}</p>
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.perigo {
  padding: 0.25rem 0.75rem;
  border-left: 4px solid var(--cor-nivel);
  transition: background 0.25s ease;
}
.nivel-0 {
  --cor-nivel: var(--risco-baixo);
}
.nivel-1 {
  --cor-nivel: var(--risco-moderado);
}
.nivel-2 {
  --cor-nivel: var(--risco-alto);
}
.nivel-3 {
  --cor-nivel: var(--risco-muito-alto);
}
.topo {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  min-height: 64px;
  padding: 0.5rem 0;
  border: 0;
  background: none;
  color: #fff;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.titulo {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.nome {
  font-weight: 700;
  font-size: 1.05rem;
}
.resumo {
  font-size: 0.82rem;
  color: var(--texto-suave);
}
.seta {
  font-size: 1.5rem;
  color: var(--texto-fraco);
  transition: transform 0.3s var(--mola);
}
.aberto .seta {
  transform: rotate(90deg);
}
.corpo {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s var(--suave);
}
.aberto .corpo {
  grid-template-rows: 1fr;
}
.interior {
  overflow: hidden;
}
.aberto .interior {
  padding-bottom: 0.9rem;
}
.conselho {
  margin: 0 0 0.85rem;
  padding: 0.65rem 0.8rem;
  border-radius: 12px;
  background: color-mix(in srgb, var(--cor-nivel) 16%, transparent);
  font-size: 0.92rem;
}
</style>
