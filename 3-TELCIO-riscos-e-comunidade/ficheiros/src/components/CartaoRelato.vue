<script setup>
import { computed } from 'vue'
import { infoTipoRelato, haQuantoTempo } from '../services/comunidade'

// Um relato da comunidade. Emite "confirmar" (ainda é verdade) e "denunciar".
const props = defineProps({
  relato: { type: Object, required: true },
  confirmado: { type: Boolean, default: false },
  denunciado: { type: Boolean, default: false },
  mostrarCidade: { type: Boolean, default: false },
})

const emit = defineEmits(['confirmar', 'denunciar', 'retirar-denuncia'])
const tipo = computed(() => infoTipoRelato(props.relato.tipo))
</script>

<template>
  <li class="cartao relato" :class="`tipo-${relato.tipo}`">
    <div class="topo">
      <span class="etiqueta"><span aria-hidden="true">{{ tipo.icone }}</span> {{ tipo.nome }}</span>
      <span class="quando texto-suave">{{ haQuantoTempo(relato.criadoEm) }}</span>
    </div>
    <strong class="local">
      {{ relato.local }}<template v-if="mostrarCidade"> · {{ relato.cidadeNome }}</template>
    </strong>
    <p class="descricao">{{ relato.descricao }}</p>
    <p v-if="relato.alternativa" class="alternativa">
      <span aria-hidden="true">↪️</span> <strong>Alternativa:</strong> {{ relato.alternativa }}
    </p>
    <div class="accoes">
      <button
        type="button"
        class="reaccao"
        :class="{ feito: confirmado }"
        :disabled="confirmado"
        @click="emit('confirmar', relato.id)"
      >
        👍 Ainda é verdade <span class="contador">{{ relato.confirmacoes }}</span>
      </button>
      <button
        v-if="!denunciado"
        type="button"
        class="reaccao discreta"
        @click="emit('denunciar', relato.id)"
      >
        Denunciar
      </button>
      <span v-else class="denunciado">
        Denunciou este relato ·
        <button type="button" class="anular" @click="emit('retirar-denuncia', relato.id)">Anular</button>
      </span>
    </div>
  </li>
</template>

<style scoped>
.relato {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border-left: 4px solid var(--cor-tipo, rgba(255, 255, 255, 0.4));
}
.tipo-via-fechada,
.tipo-ponte-danificada {
  --cor-tipo: var(--risco-muito-alto);
}
.tipo-zona-alagada {
  --cor-tipo: var(--risco-alto);
}
.tipo-via-alternativa,
.tipo-abrigo-aberto {
  --cor-tipo: var(--risco-baixo);
}
.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
.etiqueta {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.quando {
  font-size: 0.8rem;
}
.local {
  font-size: 1.02rem;
}
.descricao,
.alternativa {
  margin: 0;
  font-size: 0.92rem;
}
.alternativa {
  padding: 0.45rem 0.65rem;
  border-radius: 10px;
  background: rgba(74, 222, 128, 0.14);
}
.accoes {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.3rem;
}
.reaccao {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 36px;
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--vidro-borda);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.25s var(--mola);
}
.reaccao:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}
.reaccao:active:not(:disabled) {
  transform: scale(0.94);
}
.reaccao.feito {
  background: rgba(74, 222, 128, 0.25);
  border-color: rgba(74, 222, 128, 0.6);
}
.reaccao:disabled {
  cursor: default;
}
.discreta {
  border-color: transparent;
  background: none;
  color: var(--texto-fraco);
}
.denunciado {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--texto-fraco);
  animation: aparecer 0.25s var(--suave);
}
.anular {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--vidro-borda);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}
.anular:hover {
  background: rgba(255, 255, 255, 0.24);
}
.contador {
  font-weight: 700;
}
</style>
