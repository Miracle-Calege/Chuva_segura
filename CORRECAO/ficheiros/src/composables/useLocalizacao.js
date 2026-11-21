import { ref } from 'vue'

/** Localização actual do telemóvel (só é pedida quando o utilizador carrega no botão). */
export function useLocalizacao() {
  const posicao = ref(null)
  const aObter = ref(false)
  const erro = ref('')

  const MENSAGENS = {
    1: 'Não deu permissão para usar a localização. Pode activá-la nas definições do navegador.',
    2: 'Não foi possível saber a sua localização. Verifique se o GPS está ligado.',
    3: 'A localização demorou demasiado. Tente de novo num lugar aberto.',
  }

  function obter() {
    erro.value = ''
    if (!('geolocation' in navigator)) {
      erro.value = 'Este navegador não permite obter a localização.'
      return Promise.resolve(null)
    }
    aObter.value = true
    return new Promise((resolver) => {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          posicao.value = { latitude: p.coords.latitude, longitude: p.coords.longitude, precisao: p.coords.accuracy }
          aObter.value = false
          resolver(posicao.value)
        },
        (e) => {
          erro.value = MENSAGENS[e.code] ?? 'Não foi possível obter a localização.'
          aObter.value = false
          resolver(null)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5 * 60 * 1000 },
      )
    })
  }

  function limpar() {
    posicao.value = null
  }

  return { posicao, aObter, erro, obter, limpar }
}
