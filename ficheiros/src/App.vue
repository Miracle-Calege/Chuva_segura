<script setup>
import CabecalhoApp from './components/CabecalhoApp.vue'
import RodapeApp from './components/RodapeApp.vue'
import FundoCeu from './components/FundoCeu.vue'
import { useCeu } from './composables/useCeu'

const { ceu } = useCeu()
</script>

<template>
  <FundoCeu :ceu="ceu" />
  <CabecalhoApp />
  <main class="contentor principal">
    <RouterView v-slot="{ Component, route }">
      <Transition name="pagina" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
  <RodapeApp />
</template>

<style scoped>
.principal {
  flex: 1;
  padding-top: 0.75rem;
  padding-bottom: 2rem;
}
</style>
