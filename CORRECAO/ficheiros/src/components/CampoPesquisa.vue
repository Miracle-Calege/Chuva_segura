<script setup>
// Campo de pesquisa reutilizável. Funciona com v-model e avisa o pai quando o utilizador submete.
defineProps({
  modelValue: { type: String, default: '' },
  rotulo: { type: String, default: 'Procurar cidade, vila ou aldeia' },
  placeholder: { type: String, default: 'Procurar cidade, vila ou aldeia' },
  aCarregar: { type: Boolean, default: false },
  focarAoAbrir: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'pesquisar'])
</script>

<template>
  <form class="pesquisa" role="search" @submit.prevent="emit('pesquisar', modelValue.trim())">
    <label for="campo-pesquisa" class="visualmente-oculto">{{ rotulo }}</label>
    <div class="caixa" :class="{ activo: aCarregar }">
      <svg class="lupa" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2" />
        <path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      </svg>
      <input
        id="campo-pesquisa"
        type="search"
        :value="modelValue"
        :placeholder="placeholder"
        autocomplete="off"
        enterkeyhint="search"
        maxlength="60"
        :autofocus="focarAoAbrir"
        @input="emit('update:modelValue', $event.target.value)"
      />
      <Transition name="limpar">
        <button
          v-if="modelValue"
          type="button"
          class="limpar"
          aria-label="Limpar pesquisa"
          @click="emit('update:modelValue', '')"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
          </svg>
        </button>
      </Transition>
      <span v-if="aCarregar" class="a-carregar" aria-hidden="true"></span>
    </div>
  </form>
</template>

<style scoped>
.caixa {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s var(--mola);
}
.caixa:focus-within {
  background: rgba(255, 255, 255, 0.24);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.14);
  transform: scale(1.01);
}
.lupa {
  position: absolute;
  left: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
  pointer-events: none;
}
input {
  flex: 1;
  min-height: 52px;
  padding: 0.6rem 3rem 0.6rem 2.8rem;
  border: 0;
  background: transparent;
  color: #fff;
  font: inherit;
  font-size: 17px;
}
input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
input:focus {
  outline: none;
}
input::-webkit-search-cancel-button {
  display: none;
}
.limpar {
  position: absolute;
  right: 0.6rem;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s var(--mola);
}
.limpar:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: rotate(90deg);
}
.limpar-enter-active,
.limpar-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s var(--mola);
}
.limpar-enter-from,
.limpar-leave-to {
  opacity: 0;
  transform: scale(0.4);
}
/* linha animada por baixo enquanto procura */
.a-carregar {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, #fff, transparent);
  background-size: 50% 100%;
  background-repeat: no-repeat;
  animation: correr 1s linear infinite;
}
@keyframes correr {
  from {
    background-position: -50% 0;
  }
  to {
    background-position: 150% 0;
  }
}
</style>
