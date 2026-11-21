<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import CampoPesquisa from '../components/CampoPesquisa.vue'
import CartaoCidade from '../components/CartaoCidade.vue'
import EstadoPedido from '../components/EstadoPedido.vue'
import AvisosGdacs from '../components/AvisosGdacs.vue'
import IconePerigo from '../components/IconePerigo.vue'
import { useCapitais } from '../composables/useCapitais'
import { useAvisosGdacs } from '../composables/useAvisosGdacs'
import { useCeu } from '../composables/useCeu'

const router = useRouter()
const termo = ref('')
const { ordenadas, aCarregar, erro, erroPrevisao, recarregar } = useCapitais()
const {
  eventos: eventosGdacs,
  activos,
  recentes,
  actualizadoEm,
  aCarregar: aCarregarGdacs,
  erro: erroGdacs,
  recarregar: recarregarGdacs,
} = useAvisosGdacs()
const { repor } = useCeu()

onMounted(repor)

function irParaPesquisa(texto) {
  router.push({ name: 'pesquisa', query: texto ? { q: texto } : {} })
}

function abrirCidade(cidade) {
  router.push({ name: 'cidade', params: { id: cidade.id } })
}
</script>

<template>
  <div class="pagina-inicio">
    <section class="apresentacao">
      <div class="icones" aria-hidden="true">
        <IconePerigo perigo="cheia" :tamanho="44" cor="#7cc8ff" />
        <IconePerigo perigo="vento" :tamanho="44" cor="#c7d7ff" />
        <IconePerigo perigo="seca" :tamanho="44" />
      </div>
      <h1>Cheias, ciclones e secas</h1>
      <p class="texto-suave">Saiba o risco na sua zona, onde se abrigar e que vias evitar.</p>
      <CampoPesquisa v-model="termo" placeholder="A sua cidade, vila ou aldeia" @pesquisar="irParaPesquisa" />
    </section>

    <nav class="atalhos" aria-label="Acções rápidas">
      <RouterLink :to="{ name: 'abrigos' }" class="cartao atalho entra">
        <span class="emoji" aria-hidden="true">🏫</span>
        <span><strong>Onde me abrigar</strong><small>Locais em terreno alto perto de si</small></span>
      </RouterLink>
      <RouterLink :to="{ name: 'comunidade' }" class="cartao atalho entra" style="--i: 1">
        <span class="emoji" aria-hidden="true">↪️</span>
        <span><strong>Vias e relatos</strong><small>Estradas fechadas e caminhos alternativos</small></span>
      </RouterLink>
    </nav>

    <EstadoPedido
      :a-carregar="aCarregarGdacs && eventosGdacs.length === 0"
      :erro="erroGdacs"
      :esqueleto="[70]"
      @tentar-novamente="recarregarGdacs"
    >
      <AvisosGdacs :activos="activos" :recentes="recentes" :actualizado-em="actualizadoEm" />
    </EstadoPedido>

    <section class="capitais" aria-labelledby="titulo-capitais">
      <h2 id="titulo-capitais" class="titulo-cartao">Capitais provinciais · próximos 3 dias</h2>

      <EstadoPedido
        :a-carregar="aCarregar && ordenadas.length === 0"
        :erro="erro"
        :vazio="!aCarregar && ordenadas.length === 0"
        :esqueleto="[92, 92, 92, 92]"
        @tentar-novamente="recarregar"
      >
        <p v-if="erroPrevisao" class="aviso entra" role="alert">
          {{ erroPrevisao }}
          <button type="button" class="botao secundario" @click="recarregar">Tentar novamente</button>
        </p>
        <div class="grelha tres">
          <CartaoCidade
            v-for="(cidade, i) in ordenadas"
            :key="cidade.id"
            class="entra"
            :style="{ '--i': i }"
            :cidade="cidade"
            :risco="cidade.risco"
            :actual="cidade.actual"
            @seleccionar="abrirCidade"
          />
        </div>
      </EstadoPedido>
    </section>
  </div>
</template>

<style scoped>
.apresentacao {
  padding: 1.25rem 0 1rem;
}
.icones {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
}
.apresentacao h1 {
  font-size: 2.1rem;
  margin-bottom: 0.2rem;
}
.apresentacao p {
  margin: 0 0 1rem;
}
.atalhos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}
.atalho {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem;
  text-decoration: none;
  transition:
    transform 0.3s var(--mola),
    background 0.25s ease;
}
.atalho:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.2);
}
.atalho:active {
  transform: scale(0.97);
}
.atalho > span:last-child {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.atalho small {
  font-size: 0.78rem;
  color: var(--texto-suave);
}
.emoji {
  font-size: 1.6rem;
}
.capitais {
  margin-top: 1.25rem;
}
.aviso {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 14px;
  background: rgba(250, 204, 21, 0.18);
  border: 1px solid rgba(250, 204, 21, 0.4);
  font-size: 0.9rem;
}
@media (max-width: 420px) {
  .atalho {
    flex-direction: column;
    align-items: flex-start;
  }
}
@media (min-width: 640px) {
  .apresentacao h1 {
    font-size: 2.7rem;
  }
}
</style>
