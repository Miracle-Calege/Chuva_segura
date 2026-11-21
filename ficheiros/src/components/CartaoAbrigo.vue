<script setup>
import { formatarDistancia, ligacaoDireccoes, ligacaoMapa } from '../utils/geo'
import { formatarNumero } from '../utils/tempo'

// Um possível abrigo em terreno alto, com a distância, o desnível e ligações para o caminho.
defineProps({
  local: { type: Object, required: true },
  posicao: { type: Number, default: 0 },
  aPartirDe: { type: String, default: 'do centro' }, // "de si" quando se usa a localização
})

const ICONES = {
  school: '🏫',
  college: '🏫',
  university: '🎓',
  community_centre: '🏛️',
  hospital: '🏥',
  clinic: '🏥',
  place_of_worship: '⛪',
  townhall: '🏛️',
  shelter: '⛺',
  assembly_point: '📍',
  police: '🚓',
  fire_station: '🚒',
}
</script>

<template>
  <li class="cartao abrigo entra" :style="{ '--i': posicao }">
    <span class="icone" aria-hidden="true">{{ ICONES[local.tipo] ?? '📍' }}</span>
    <div class="info">
      <strong class="nome">{{ local.nome }}</strong>
      <span class="tipo">{{ local.tipoNome }} · {{ formatarDistancia(local.distanciaKm) }} {{ aPartirDe }}</span>
      <span v-if="local.desnivel !== null && local.desnivel >= 3" class="altura">
        <span class="seta-cima" aria-hidden="true">▲</span> {{ formatarNumero(Math.round(local.desnivel)) }} m mais alto
        <span class="texto-suave">({{ formatarNumero(Math.round(local.altitude)) }} m de altitude)</span>
      </span>
      <span v-else-if="local.desnivel !== null" class="altura igual">
        À mesma altura ({{ formatarNumero(Math.round(local.altitude)) }} m) — edifício sólido, use o andar de cima
      </span>
    </div>
    <div class="accoes">
      <a :href="ligacaoDireccoes(local)" target="_blank" rel="noopener" class="botao pequeno">Ir</a>
      <a :href="ligacaoMapa(local)" target="_blank" rel="noopener" class="ligacao-mapa">Mapa</a>
    </div>
  </li>
</template>

<style scoped>
.abrigo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 0.9rem;
  transition: transform 0.3s var(--mola);
}
.abrigo:hover {
  transform: translateY(-2px);
}
.icone {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 1.4rem;
}
.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.nome {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tipo {
  font-size: 0.82rem;
  color: var(--texto-suave);
}
.altura {
  font-size: 0.85rem;
  font-weight: 650;
}
.altura.igual {
  font-weight: 500;
  color: var(--texto-suave);
}
.seta-cima {
  color: var(--risco-baixo);
}
.altura .texto-suave {
  font-weight: 400;
}
.accoes {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}
.botao.pequeno {
  min-height: 38px;
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
}
.ligacao-mapa {
  font-size: 0.75rem;
  color: var(--texto-suave);
}
</style>
