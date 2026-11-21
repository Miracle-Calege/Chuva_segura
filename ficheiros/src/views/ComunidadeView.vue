<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import EstadoPedido from '../components/EstadoPedido.vue'
import CartaoRelato from '../components/CartaoRelato.vue'
import FormularioRelato from '../components/FormularioRelato.vue'
import CampoPesquisa from '../components/CampoPesquisa.vue'
import { useRelatos } from '../composables/useRelatos'
import { useLocalidade } from '../composables/useLocalidade'
import { useCeu } from '../composables/useCeu'

const route = useRoute()
const router = useRouter()
const idCidade = computed(() => (/^\d+$/.test(String(route.query.cidade ?? '')) ? String(route.query.cidade) : ''))

const { cidade } = useLocalidade(idCidade)
const { relatos, aCarregar, erro, local, reagidos, carregar, publicar, reagir } = useRelatos(idCidade)
const { repor } = useCeu()
onMounted(repor)

const aEscrever = ref(false)
const aPublicar = ref(false)
const erroPublicar = ref('')
const publicado = ref(false)
const formulario = ref(null)
const termo = ref('')

async function aoSubmeter(dados) {
  aPublicar.value = true
  erroPublicar.value = ''
  try {
    await publicar({ ...dados, cidadeId: cidade.value.id, cidadeNome: cidade.value.nome })
    formulario.value?.limpar()
    aEscrever.value = false
    publicado.value = true
    setTimeout(() => (publicado.value = false), 4000)
  } catch (e) {
    erroPublicar.value = e.message
  } finally {
    aPublicar.value = false
  }
}

function procurarLocalidade(texto) {
  router.push({ name: 'pesquisa', query: texto ? { q: texto } : {} })
}
</script>

<template>
  <div class="pagina-comunidade">
    <header class="topo entra">
      <h1>Vias e relatos</h1>
      <p class="texto-suave">
        Estradas fechadas, zonas alagadas e caminhos alternativos contados por quem lá está
        <template v-if="cidade">— {{ cidade.nome }}</template>.
      </p>
    </header>

    <p v-if="local" class="cartao aviso modo-local">
      🧪 Modo de demonstração: por agora os relatos ficam guardados só neste aparelho.
    </p>

    <div class="conteudo">
      <div class="barra-accoes entra" style="--i: 1">
        <RouterLink v-if="idCidade" :to="{ name: 'comunidade' }" class="filtro">Todo o país</RouterLink>
        <RouterLink v-if="idCidade" :to="{ name: 'cidade', params: { id: idCidade } }" class="filtro">
          Riscos em {{ cidade?.nome ?? '…' }}
        </RouterLink>
        <button v-if="cidade && !aEscrever" type="button" class="botao relatar" @click="aEscrever = true">
          + Relatar
        </button>
      </div>

      <div v-if="!idCidade" class="cartao escolher entra" style="--i: 1">
        <p>Para relatar, escolha primeiro a localidade:</p>
        <CampoPesquisa v-model="termo" placeholder="Ex.: Beira, Chókwè, Mocuba" @pesquisar="procurarLocalidade" />
      </div>

      <Transition name="abrir">
        <FormularioRelato
          v-if="aEscrever && cidade"
          ref="formulario"
          class="formulario"
          :nome-cidade="cidade.nome"
          :a-enviar="aPublicar"
          @submeter="aoSubmeter"
          @cancelar="aEscrever = false"
        />
      </Transition>
      <p v-if="erroPublicar" class="cartao aviso falha" role="alert">{{ erroPublicar }}</p>
      <Transition name="abrir">
        <p v-if="publicado" class="cartao aviso sucesso" role="status">✅ Relato publicado. Obrigado por avisar a comunidade!</p>
      </Transition>

      <EstadoPedido
        :a-carregar="aCarregar && relatos.length === 0"
        :erro="erro"
        :vazio="!aCarregar && relatos.length === 0"
        :texto-vazio="cidade ? `Ainda não há relatos em ${cidade.nome} nas últimas 72 horas.` : 'Ainda não há relatos nas últimas 72 horas.'"
        :esqueleto="[110, 110, 110]"
        @tentar-novamente="carregar"
      >
        <TransitionGroup tag="ul" name="lista" class="lista">
          <CartaoRelato
            v-for="r in relatos"
            :key="r.id"
            :relato="r"
            :mostrar-cidade="!idCidade"
            :confirmado="reagidos.has(`confirmar:${r.id}`)"
            :denunciado="reagidos.has(`denunciar:${r.id}`)"
            @confirmar="reagir($event, 'confirmar')"
            @denunciar="reagir($event, 'denunciar')"
            @retirar-denuncia="reagir($event, 'retirar-denuncia')"
          />
        </TransitionGroup>
      </EstadoPedido>
    </div>
  </div>
</template>

<style scoped>
.pagina-comunidade {
  max-width: 760px;
  margin: 0 auto;
}
.topo {
  margin: 1rem 0;
}
.topo p {
  margin: 0;
}
.barra-accoes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.filtro {
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  transition: background 0.2s ease;
}
.filtro:hover {
  background: rgba(255, 255, 255, 0.24);
}
.relatar {
  margin-left: auto;
}
.escolher {
  margin-bottom: 1rem;
}
.escolher p {
  margin: 0 0 0.6rem;
}
.formulario {
  margin-bottom: 1rem;
}
.aviso {
  margin: 0 0 1rem;
  font-size: 0.92rem;
}
.modo-local {
  font-size: 0.85rem;
  background: rgba(124, 200, 255, 0.14);
  border-color: rgba(124, 200, 255, 0.4);
}
.falha {
  border-color: rgba(248, 113, 113, 0.6);
  background: rgba(248, 113, 113, 0.18);
}
.sucesso {
  border-color: rgba(74, 222, 128, 0.6);
  background: rgba(74, 222, 128, 0.16);
}
.lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}
.lista-enter-active,
.lista-leave-active {
  transition:
    opacity 0.4s var(--suave),
    transform 0.4s var(--suave);
}
.lista-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}
.lista-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.abrir-enter-active,
.abrir-leave-active {
  transition:
    opacity 0.3s var(--suave),
    transform 0.3s var(--suave);
}
.abrir-enter-from,
.abrir-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
