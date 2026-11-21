<script setup>
import { useFormularioRelato } from '../composables/useFormularioRelato'
import { TIPOS_RELATO } from '../services/comunidade'

// Formulário para relatar uma via fechada, zona alagada, caminho alternativo, etc.
// Valida os campos e emite "submeter"; o pai trata do envio.
defineProps({
  aEnviar: { type: Boolean, default: false },
  nomeCidade: { type: String, default: '' },
})

const emit = defineEmits(['submeter', 'cancelar'])
const { campos, valido, erroDe, marcarTocado, marcarTodos, limpar } = useFormularioRelato()

function aoSubmeter() {
  marcarTodos()
  if (!valido.value) return
  emit('submeter', {
    tipo: campos.tipo,
    local: campos.local.trim(),
    descricao: campos.descricao.trim(),
    alternativa: campos.alternativa.trim(),
  })
}

defineExpose({ limpar })
</script>

<template>
  <form class="cartao formulario-relato" novalidate @submit.prevent="aoSubmeter">
    <h2>Relatar em {{ nomeCidade }}</h2>

    <fieldset class="tipos">
      <legend class="visualmente-oculto">Tipo de relato</legend>
      <label v-for="t in TIPOS_RELATO" :key="t.id" class="tipo" :class="{ activo: campos.tipo === t.id }">
        <input v-model="campos.tipo" type="radio" name="tipo" :value="t.id" />
        <span aria-hidden="true">{{ t.icone }}</span> {{ t.nome }}
      </label>
    </fieldset>

    <div class="campo">
      <label for="relato-local">Onde? (rua, ponte, bairro)</label>
      <input
        id="relato-local"
        v-model="campos.local"
        type="text"
        maxlength="80"
        placeholder="Ex.: Ponte sobre o rio Púnguè, Estrada N6"
        :aria-invalid="erroDe('local') ? 'true' : 'false'"
        @blur="marcarTocado('local')"
      />
      <p class="erro-campo" aria-live="polite">{{ erroDe('local') }}</p>
    </div>

    <div class="campo">
      <label for="relato-descricao">O que se passa?</label>
      <textarea
        id="relato-descricao"
        v-model="campos.descricao"
        rows="3"
        maxlength="280"
        placeholder="Ex.: A água cobre a estrada desde ontem; carros pequenos não passam."
        :aria-invalid="erroDe('descricao') ? 'true' : 'false'"
        @blur="marcarTocado('descricao')"
      ></textarea>
      <span class="contador">{{ campos.descricao.length }}/280</span>
      <p class="erro-campo" aria-live="polite">{{ erroDe('descricao') }}</p>
    </div>

    <div class="campo">
      <label for="relato-alternativa">Caminho alternativo (opcional)</label>
      <input
        id="relato-alternativa"
        v-model="campos.alternativa"
        type="text"
        maxlength="200"
        placeholder="Ex.: Passar pela Av. Samora Machel e seguir até ao mercado"
        :aria-invalid="erroDe('alternativa') ? 'true' : 'false'"
        @blur="marcarTocado('alternativa')"
      />
      <p class="erro-campo" aria-live="polite">{{ erroDe('alternativa') }}</p>
    </div>

    <p class="nota texto-suave">Não escreva nomes, telefones nem e-mails. Os relatos desaparecem ao fim de 72 horas.</p>

    <div class="botoes">
      <button type="button" class="botao secundario" @click="emit('cancelar')">Cancelar</button>
      <button type="submit" class="botao" :disabled="aEnviar">{{ aEnviar ? 'A publicar…' : 'Publicar' }}</button>
    </div>
  </form>
</template>

<style scoped>
h2 {
  margin-bottom: 0.75rem;
}
.tipos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0 0 1rem;
  padding: 0;
  border: 0;
}
.tipo {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--vidro-borda);
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.85rem;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.25s var(--mola);
}
.tipo:hover {
  background: rgba(255, 255, 255, 0.16);
}
.tipo.activo {
  background: #fff;
  color: var(--azul);
  font-weight: 650;
  transform: scale(1.04);
}
.tipo input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.tipo:has(input:focus-visible) {
  outline: 3px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}
textarea {
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--vidro-borda);
  border-radius: 14px;
  font: inherit;
  font-size: 16px;
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
  resize: vertical;
}
textarea::placeholder {
  color: rgba(255, 255, 255, 0.55);
}
textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.15);
}
.contador {
  align-self: flex-end;
  font-size: 0.75rem;
  color: var(--texto-fraco);
}
.erro-campo:empty {
  display: none;
}
.nota {
  font-size: 0.8rem;
  margin: 0 0 0.9rem;
}
.botoes {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
