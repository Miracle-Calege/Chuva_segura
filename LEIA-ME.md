# Ivan — Configuração inicial (commit directo no `main`)

Contém: `package.json` + `package-lock.json`, `vite.config.js` (com `base`), `index.html`, `.gitignore` (inclui `.env`), `.env.example` (sem valores), workflow do GitHub Pages (publica a cada push e de 3 em 3 horas para actualizar os avisos do GDACS), `main.js`, `App.vue` (com a transição entre páginas), router com **todas** as rotas (hash history + 404), estilos globais, cabeçalho, rodapé (origem dos dados), fundo do céu animado, ícones animados do tempo, `useCeu`, `utils/tempo.js`, página 404, README e **páginas provisórias** que os colegas vão substituir.

## Comandos
```bash
git clone https://github.com/<o-teu-utilizador>/pwebii-2026-grupo5-chuva-segura.git
cd pwebii-2026-grupo5-chuva-segura
```
Copiar **todo o conteúdo** de `ficheiros/` para dentro desta pasta (no Windows, activar «Itens ocultos» para ver `.gitignore`, `.env.example` e `.github`).
```bash
npm install
npm run dev            # deve abrir a app com páginas "em construção"
git status             # NÃO pode aparecer node_modules nem .env
git add .
git commit -m "Configuração inicial do projecto Vue com Vite, Router e publicação no GitHub Pages"
git push -u origin main
```
Depois: proteger o `main` (guia geral, Passo 2).

## Explicar na defesa
- `base` no `vite.config.js` = nome do repositório (o site fica em `utilizador.github.io/nome-do-repo/`).
- `createWebHashHistory()`: as rotas ficam depois do `#`, por isso recarregar a página no GitHub Pages não dá 404.
- `() => import(...)` nas rotas: cada página só é descarregada quando é aberta (poupa dados móveis).
- `/:caminho(.*)*` apanha qualquer endereço inexistente → `NotFoundView`.
- `useCeu` é um estado global simples (um `ref` fora da função) partilhado pelo `App.vue` e pelas páginas.
