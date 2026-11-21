<script setup>
import IconeTempo from './IconeTempo.vue'

// Mostra o estado de um pedido de dados: a carregar (esqueleto), erro ou lista vazia.
// Quando está tudo bem, mostra o conteúdo do slot.
defineProps({
  aCarregar: { type: Boolean, default: false },
  erro: { type: String, default: '' },
  vazio: { type: Boolean, default: false },
  textoCarregar: { type: String, default: 'A carregar…' },
  textoVazio: { type: String, default: 'Sem resultados.' },
  esqueleto: { type: Array, default: () => [96, 96, 96] }, // alturas (px) dos blocos de carregamento
})

const emit = defineEmits(['tentar-novamente'])
</script>

<template>
  <div v-if="aCarregar" class="carregar" role="status" aria-live="polite">
    <span class="visualmente-oculto">{{ textoCarregar }}</span>
    <div v-for="(altura, i) in esqueleto" :key="i" class="esqueleto" :style="{ height: `${altura}px` }"></div>
  </div>

  <div v-else-if="erro" class="cartao estado entra" role="alert">
    <IconeTempo :codigo="95" :tamanho="56" />
    <p>{{ erro }}</p>
    <button type="button" class="botao" @click="emit('tentar-novamente')">Tentar novamente</button>
  </div>

  <div v-else-if="vazio" class="cartao estado entra">
    <IconeTempo :codigo="45" :tamanho="56" />
    <p>{{ textoVazio }}</p>
    <slot name="vazio" />
  </div>

  <slot v-else />
</template>

<style scoped>
.carregar {
  display: grid;
  gap: 0.75rem;
}
.estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  padding: 1.5rem 1rem;
}
.estado p {
  margin: 0;
  max-width: 32rem;
}
</style>
