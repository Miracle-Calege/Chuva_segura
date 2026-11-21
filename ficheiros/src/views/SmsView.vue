<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import EstadoPedido from '../components/EstadoPedido.vue'
import IndicadorRisco from '../components/IndicadorRisco.vue'
import IconePerigo from '../components/IconePerigo.vue'
import FormularioSms from '../components/FormularioSms.vue'
import { usePrevisaoCidade } from '../composables/usePrevisaoCidade'
import { useCeu } from '../composables/useCeu'
import { corNivel } from '../utils/risco'
import { ceuDe } from '../utils/tempo'
import { servidorConfigurado } from '../services/servidor'
import { enviarSms, montarTextoSms } from '../services/sms'

const props = defineProps({ id: { type: String, required: true } })

// Reaproveita os dados já em cache quando se vem da página da localidade (sem novo pedido).
const { cidade, actual, riscos, aCarregar, erro, recarregar } = usePrevisaoCidade(() => props.id)
const { definirCeu } = useCeu()
watch(actual, (a) => a && definirCeu(ceuDe(a.codigoTempo, a.eDia)), { immediate: true })

const configurado = servidorConfigurado()
const estado = ref('inicial') // 'inicial' | 'a-enviar' | 'enviado' | 'erro'
const mensagemErro = ref('')
const numeroEnviado = ref('')
const formulario = ref(null)

const texto = computed(() => (cidade.value && riscos.value ? montarTextoSms(cidade.value, riscos.value) : ''))
const numeroSms = computed(() => Math.max(1, Math.ceil(texto.value.length / 153)))
// Abre a app de mensagens do telemóvel com o texto já escrito (para enviar a familiares).
// iPhone usa "sms:&body=", Android e os restantes usam "sms:?body=".
const eIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const ligacaoAppSms = computed(() => `sms:${eIOS ? '&' : '?'}body=${encodeURIComponent(texto.value)}`)

// Evita envios repetidos (cada SMS custa dinheiro).
let ultimoEnvio = 0

async function enviar(telefone) {
  if (Date.now() - ultimoEnvio < 60 * 1000) {
    estado.value = 'erro'
    mensagemErro.value = 'Aguarde um minuto antes de enviar outro SMS.'
    return
  }
  estado.value = 'a-enviar'
  mensagemErro.value = ''
  try {
    await enviarSms(telefone, texto.value)
    ultimoEnvio = Date.now()
    numeroEnviado.value = telefone.replace(/^(\+258)(\d{2})(\d{3})(\d{4})$/, '$1 $2 $3 $4')
    estado.value = 'enviado'
    formulario.value?.limpar()
  } catch (e) {
    estado.value = 'erro'
    mensagemErro.value = e.message
  }
}
</script>

<template>
  <div class="pagina-sms">
    <RouterLink :to="{ name: 'cidade', params: { id } }" class="voltar"><span aria-hidden="true">‹</span> Riscos</RouterLink>

    <EstadoPedido
      :a-carregar="aCarregar && !riscos"
      :erro="erro"
      :vazio="!aCarregar && !erro && !riscos"
      texto-carregar="A preparar o alerta…"
      texto-vazio="Não há dados para enviar."
      :esqueleto="[100, 140, 220]"
      @tentar-novamente="recarregar"
    >
      <template v-if="cidade && riscos">
        <header class="topo entra">
          <IconePerigo
            :perigo="riscos.nivel === 0 ? 'ok' : riscos.principal.id"
            :tamanho="60"
            :cor="corNivel(riscos.nivel)"
          />
          <div>
            <h1>Alerta por SMS</h1>
            <p class="texto-suave">{{ cidade.nome }} · funciona em qualquer telemóvel, mesmo sem Internet.</p>
            <IndicadorRisco :nivel="riscos.nivel" tamanho="pequeno" :prefixo="riscos.nivel ? riscos.principal.nome : 'Risco'" />
          </div>
        </header>

        <figure class="sms entra" style="--i: 1">
          <figcaption class="titulo-cartao">Mensagem que vai receber</figcaption>
          <div class="balao">{{ texto }}</div>
          <span class="tamanho">{{ texto.length }} caracteres · {{ numeroSms }} SMS</span>
        </figure>

        <Transition name="troca" mode="out-in">
          <div v-if="estado === 'enviado'" key="ok" class="cartao sucesso" role="status">
            <svg class="visto" viewBox="0 0 52 52" width="64" height="64" aria-hidden="true">
              <circle cx="26" cy="26" r="24" fill="none" stroke="#8ff0a4" stroke-width="3" />
              <path d="M15 27l7 7 15-16" fill="none" stroke="#8ff0a4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <h2>SMS enviado</h2>
            <p class="texto-suave">Para {{ numeroEnviado }}. Pode demorar alguns minutos a chegar.</p>
            <div class="botoes">
              <RouterLink :to="{ name: 'abrigos', query: { cidade: cidade.id } }" class="botao">🏫 Onde me abrigar</RouterLink>
              <button type="button" class="botao secundario" @click="estado = 'inicial'">Enviar para outro número</button>
            </div>
          </div>

          <div v-else key="form">
            <p v-if="!configurado" class="aviso" role="alert">
              O envio automático ainda não está ligado ao servidor. Pode enviar já a mensagem pela app de SMS do seu
              telemóvel (botão abaixo).
            </p>
            <Transition name="troca">
              <p v-if="estado === 'erro'" class="aviso falha" role="alert">{{ mensagemErro }}</p>
            </Transition>
            <FormularioSms
              ref="formulario"
              class="entra"
              style="--i: 2"
              :a-enviar="estado === 'a-enviar'"
              :desactivado="!configurado"
              @submeter="enviar"
            />
            <a :href="ligacaoAppSms" class="botao secundario largo app-sms entra" style="--i: 3">
              💬 Enviar pela minha app de SMS (a familiares)
            </a>
            <p class="privacidade texto-suave">O número só é usado para enviar esta mensagem e não fica guardado.</p>
          </div>
        </Transition>
      </template>
    </EstadoPedido>
  </div>
</template>

<style scoped>
.pagina-sms {
  max-width: 560px;
  margin: 0 auto;
}
.voltar {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0.25rem 0;
  padding: 0.35rem 0.85rem 0.35rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s ease;
}
.voltar span {
  font-size: 1.3rem;
  line-height: 1;
  transition: transform 0.25s var(--mola);
}
.voltar:hover span {
  transform: translateX(-3px);
}
.topo {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin: 1rem 0 1.25rem;
}
.topo h1 {
  margin: 0;
}
.topo p {
  margin: 0 0 0.35rem;
  font-size: 0.9rem;
}
.sms {
  margin: 0 0 1.25rem;
}
/* balão de mensagem, como no telemóvel */
.balao {
  position: relative;
  max-width: 92%;
  padding: 0.75rem 0.95rem;
  border-radius: 20px 20px 20px 6px;
  background: rgba(255, 255, 255, 0.92);
  color: #14202b;
  font-size: 0.92rem;
  line-height: 1.45;
  box-shadow: 0 6px 18px rgba(0, 20, 50, 0.2);
  animation: balao 0.5s var(--mola) both 0.15s;
}
@keyframes balao {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
    transform-origin: bottom left;
  }
}
.tamanho {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: var(--texto-fraco);
}
.aviso {
  margin: 0 0 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: 14px;
  background: rgba(250, 204, 21, 0.18);
  border: 1px solid rgba(250, 204, 21, 0.4);
  font-size: 0.9rem;
}
.aviso.falha {
  background: rgba(248, 113, 113, 0.2);
  border-color: rgba(248, 113, 113, 0.5);
}
.app-sms {
  margin-top: 0.6rem;
}
.privacidade {
  margin: 0.75rem 0 0;
  font-size: 0.8rem;
  text-align: center;
}
.sucesso {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.75rem 1rem;
}
.sucesso h2 {
  margin: 0.6rem 0 0.25rem;
  font-size: 1.4rem;
}
.sucesso p {
  margin: 0 0 1rem;
}
.visto circle {
  stroke-dasharray: 151;
  stroke-dashoffset: 151;
  animation: tracar 0.6s var(--suave) forwards;
}
.visto path {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: tracar 0.4s 0.45s var(--suave) forwards;
}
@keyframes tracar {
  to {
    stroke-dashoffset: 0;
  }
}
.botoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
}
.troca-enter-active,
.troca-leave-active {
  transition:
    opacity 0.3s var(--suave),
    transform 0.3s var(--suave);
}
.troca-enter-from,
.troca-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
