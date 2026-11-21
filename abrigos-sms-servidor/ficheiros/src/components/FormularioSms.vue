<script setup>
import { useFormularioSms } from '../composables/useFormularioSms'

// Formulário com validação do número de telemóvel. Emite "submeter" com o número normalizado;
// o pai (SmsView) trata do envio e passa aEnviar enquanto envia.
defineProps({
  aEnviar: { type: Boolean, default: false },
  desactivado: { type: Boolean, default: false },
})

const emit = defineEmits(['submeter'])
const { campos, valido, telefoneNormalizado, erroDe, marcarTocado, marcarTodos, limpar } = useFormularioSms()

function aoSubmeter() {
  marcarTodos()
  if (!valido.value) {
    document.querySelector('.formulario-sms [aria-invalid="true"]')?.focus()
    return
  }
  emit('submeter', telefoneNormalizado.value)
}

defineExpose({ limpar })
</script>

<template>
  <form class="formulario-sms cartao" novalidate @submit.prevent="aoSubmeter">
    <div class="campo">
      <label for="sms-telefone">Número de telemóvel</label>
      <div class="telefone">
        <span class="indicativo">🇲🇿 +258</span>
        <input
          id="sms-telefone"
          v-model="campos.telefone"
          type="tel"
          inputmode="tel"
          autocomplete="tel-national"
          placeholder="84 123 4567"
          maxlength="16"
          :aria-invalid="erroDe('telefone') ? 'true' : 'false'"
          aria-describedby="erro-telefone"
          @blur="marcarTocado('telefone')"
        />
      </div>
      <p id="erro-telefone" class="erro-campo" aria-live="polite">{{ erroDe('telefone') }}</p>
    </div>

    <div class="campo">
      <label class="caixa-seleccao">
        <input
          v-model="campos.confirmar"
          type="checkbox"
          :aria-invalid="erroDe('confirmar') ? 'true' : 'false'"
          @change="marcarTocado('confirmar')"
        />
        <span class="marca" aria-hidden="true"></span>
        <span>Este número é meu e aceito receber o alerta.</span>
      </label>
      <p class="erro-campo" aria-live="polite">{{ erroDe('confirmar') }}</p>
    </div>

    <button type="submit" class="botao largo" :disabled="aEnviar || desactivado">
      <span v-if="aEnviar" class="roda" aria-hidden="true"></span>
      <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="6" y="2" width="12" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      {{ aEnviar ? 'A enviar…' : 'Enviar SMS' }}
    </button>
  </form>
</template>

<style scoped>
.erro-campo:empty {
  display: none;
}
.telefone {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--vidro-borda);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  overflow: hidden;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}
.telefone:focus-within {
  background: rgba(255, 255, 255, 0.22);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.15);
}
.indicativo {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  border-right: 1px solid var(--vidro-borda);
  font-weight: 600;
  white-space: nowrap;
}
.telefone input {
  flex: 1;
  min-width: 0;
  min-height: 50px;
  padding: 0.6rem 0.9rem;
  border: 0;
  background: transparent;
  color: #fff;
  font: inherit;
  font-size: 18px;
  letter-spacing: 0.04em;
}
.telefone input:focus {
  outline: none;
}
.telefone input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
.telefone:has(input[aria-invalid='true']) {
  border-color: var(--erro);
}
.caixa-seleccao {
  position: relative;
  display: flex;
  gap: 0.7rem;
  align-items: center;
  font-weight: 500 !important;
  font-size: 0.92rem;
  cursor: pointer;
}
.caixa-seleccao input {
  position: absolute;
  opacity: 0;
  width: 24px;
  height: 24px;
  margin: 0;
}
.marca {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  transition:
    background 0.2s ease,
    transform 0.25s var(--mola);
}
.marca::after {
  content: '';
  width: 6px;
  height: 11px;
  border: solid #0b4f8a;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg) scale(0);
  margin-top: -2px;
  transition: transform 0.25s var(--mola);
}
.caixa-seleccao input:checked + .marca {
  background: #fff;
  border-color: #fff;
  transform: scale(1.08);
}
.caixa-seleccao input:checked + .marca::after {
  transform: rotate(45deg) scale(1);
}
.caixa-seleccao input:focus-visible + .marca {
  outline: 3px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}
.caixa-seleccao input[aria-invalid='true'] + .marca {
  border-color: var(--erro);
}
.roda {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(11, 79, 138, 0.25);
  border-top-color: #0b4f8a;
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}
@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
</style>
