<script setup>
import { RouterLink } from 'vue-router'
import IconeTempo from '../components/IconeTempo.vue'
</script>

<template>
  <div class="pagina-404">
    <IconeTempo :codigo="45" :tamanho="96" />
    <h1>Página não encontrada</h1>
    <p class="texto-suave">Este endereço não existe.</p>
    <div class="accoes">
      <RouterLink to="/" class="botao">Voltar ao início</RouterLink>
      <RouterLink to="/pesquisa" class="botao secundario">Pesquisar</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.pagina-404 {
  text-align: center;
  padding: 3rem 1rem;
}
.accoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  margin-top: 1rem;
}
</style>
