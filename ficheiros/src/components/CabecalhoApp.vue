<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="cabecalho">
    <div class="contentor barra">
      <RouterLink to="/" class="marca" aria-label="Chuva Segura MZ — início">
        <span class="gota" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M12 2.5c-3.6 5-6.5 8.6-6.5 12a6.5 6.5 0 0 0 13 0c0-3.4-2.9-7-6.5-12z" fill="currentColor" />
          </svg>
        </span>
        <span class="nome-app">Chuva Segura <strong>MZ</strong></span>
      </RouterLink>
      <nav aria-label="Navegação principal">
        <RouterLink to="/" class="nav-ligacao" aria-label="Alertas">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M12 3l9.5 17h-19z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            <path d="M12 10v4M12 17v.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
          </svg>
          <span>Alertas</span>
        </RouterLink>
        <RouterLink to="/abrigos" class="nav-ligacao" aria-label="Abrigos">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M3 11l9-7 9 7v9H3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            <path d="M12 17V12M9.5 14.5L12 12l2.5 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Abrigos</span>
        </RouterLink>
        <RouterLink to="/comunidade" class="nav-ligacao" aria-label="Comunidade">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M4 5h16v10H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          </svg>
          <span>Vias</span>
        </RouterLink>
        <RouterLink to="/pesquisa" class="nav-ligacao" aria-label="Pesquisar">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2" />
            <path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
          </svg>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.cabecalho {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(10, 30, 60, 0.22);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.barra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 3.4rem;
}
.marca {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: #fff;
  text-decoration: none;
  font-size: 1.05rem;
  white-space: nowrap;
}
.gota {
  display: grid;
  place-items: center;
  color: #8fd3ff;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.marca:hover .gota {
  transform: translateY(-2px) rotate(-8deg) scale(1.1);
}
nav {
  display: flex;
  gap: 0.15rem;
}
.nav-ligacao {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: rgba(255, 255, 255, 0.82);
  text-decoration: none;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  font-size: 0.92rem;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}
.nav-ligacao:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.nav-ligacao:active {
  transform: scale(0.94);
}
.nav-ligacao.router-link-exact-active {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}
@media (max-width: 560px) {
  .nav-ligacao span {
    display: none;
  }
  .nav-ligacao {
    padding: 0.55rem 0.6rem;
  }
}
@media (max-width: 360px) {
  .nome-app {
    display: none;
  }
}
</style>
