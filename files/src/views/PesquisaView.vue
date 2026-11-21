<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CampoPesquisa from '../components/CampoPesquisa.vue'
import CartaoCidade from '../components/CartaoCidade.vue'
import EstadoPedido from '../components/EstadoPedido.vue'
import IconeTempo from '../components/IconeTempo.vue'
import { usePesquisaCidades } from '../composables/usePesquisaCidades'
import { useCeu } from '../composables/useCeu'

const route = useRoute()
const router = useRouter()
const { resultados, aCarregar, erro, termoPesquisado, pesquisar } = usePesquisaCidades()
const { repor } = useCeu()
onMounted(repor)

// O termo fica no endereço (?q=…): o botão "voltar" e os links partilhados mantêm a pesquisa.
const termo = ref(String(route.query.q ?? ''))
let temporizador = null

function actualizarEndereco(texto) {
  const q = texto.trim()
  if (q === String(route.query.q ?? '')) return
  router.replace({ name: 'pesquisa', query: q ? { q } : {} })
}

// Pesquisa automática enquanto escreve, com uma pausa de 500 ms (evita um pedido por cada letra).
watch(termo, (novo) => {
  clearTimeout(temporizador)
  temporizador = setTimeout(() => actualizarEndereco(novo), 500)
})

watch(
  () => route.query.q,
  (q) => {
    const texto = String(q ?? '')
    if (texto !== termo.value.trim()) termo.value = texto
    pesquisar(texto)
  },
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(temporizador))

function pesquisarAgora(texto) {
  clearTimeout(temporizador)
  if (texto === String(route.query.q ?? '')) pesquisar(texto)
  else actualizarEndereco(texto)
}

function abrirCidade(cidade) {
  router.push({ name: 'cidade', params: { id: cidade.id } })
}
</script>

<template>
  <div class="pagina-pesquisa">
    <h1>Pesquisar</h1>
    <CampoPesquisa v-model="termo" :a-carregar="aCarregar" focar-ao-abrir @pesquisar="pesquisarAgora" />

    <section class="resultados" aria-live="polite">
      <div v-if="!termoPesquisado && !aCarregar && !erro" class="inicial entra">
        <IconeTempo :codigo="2" :tamanho="88" />
        <p class="texto-suave">Escreva o nome de uma cidade, vila ou aldeia.</p>
      </div>

      <EstadoPedido
        v-else
        :a-carregar="aCarregar && resultados.length === 0"
        :erro="erro"
        :vazio="resultados.length === 0"
        :texto-vazio="`Nenhuma localidade encontrada para «${termoPesquisado}».`"
        :esqueleto="[72, 72, 72]"
        @tentar-novamente="pesquisar(termo)"
      >
        <div class="grelha">
          <CartaoCidade
            v-for="(cidade, i) in resultados"
            :key="cidade.id"
            class="entra"
            :style="{ '--i': i }"
            :cidade="cidade"
            @seleccionar="abrirCidade"
          />
        </div>
      </EstadoPedido>
    </section>
  </div>
</template>

<style scoped>
.pagina-pesquisa {
  max-width: 760px;
  margin: 0 auto;
}
h1 {
  padding-top: 0.75rem;
}
.resultados {
  margin-top: 1.25rem;
}
.inicial {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1rem;
}
.inicial p {
  margin: 0.5rem 0 0;
}
.resultados :deep(.cartao-cidade) {
  min-height: 72px;
}
</style>
