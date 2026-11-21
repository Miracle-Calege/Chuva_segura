import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// createWebHashHistory: as rotas funcionam ao actualizar a página no GitHub Pages.
// As páginas menos usadas são carregadas só quando são abertas (poupa dados móveis).
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'inicio', component: HomeView, meta: { titulo: 'Alertas' } },
    {
      path: '/pesquisa',
      name: 'pesquisa',
      component: () => import('../views/PesquisaView.vue'),
      meta: { titulo: 'Pesquisar localidade' },
    },
    {
      path: '/cidade/:id(\\d+)',
      name: 'cidade',
      component: () => import('../views/CidadeView.vue'),
      props: true,
      meta: { titulo: 'Riscos da localidade' },
    },
    {
      path: '/cidade/:id(\\d+)/sms',
      name: 'sms',
      component: () => import('../views/SmsView.vue'),
      props: true,
      meta: { titulo: 'Alerta por SMS' },
    },
    {
      path: '/abrigos',
      name: 'abrigos',
      component: () => import('../views/AbrigosView.vue'),
      meta: { titulo: 'Onde me abrigar' },
    },
    {
      path: '/comunidade',
      name: 'comunidade',
      component: () => import('../views/ComunidadeView.vue'),
      meta: { titulo: 'Vias e relatos' },
    },
    {
      path: '/:caminho(.*)*',
      name: 'nao-encontrado',
      component: () => import('../views/NotFoundView.vue'),
      meta: { titulo: 'Página não encontrada' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = `${to.meta.titulo ?? 'Chuva Segura'} · Chuva Segura MZ`
})

export default router
