# Ivan — branch `ivan/dados-e-riscos`

Camada de dados e de risco que todas as páginas usam. **Tem de entrar no `main` antes dos outros começarem.**

## Comandos
```bash
git switch main && git pull
git switch -c ivan/dados-e-riscos
```
Copiar o conteúdo de `ficheiros/` para o repositório (só ficheiros novos). Depois, **4 commits**:
```bash
git add src/services/http.js src/services/openMeteo.js src/services/servidor.js
git commit -m "Adiciona acesso à Open-Meteo e ao servidor com cache e tratamento de erros"

git add src/utils/risco.js src/components/IndicadorRisco.vue src/components/IconePerigo.vue
git commit -m "Adiciona avaliação do risco de cheia, ciclone e seca com ícones animados"

git add src/components/EstadoPedido.vue src/components/CampoPesquisa.vue
git commit -m "Adiciona componentes de estado do pedido e de campo de pesquisa"

git add src/composables/
git commit -m "Adiciona composables de pesquisa, previsão e localidade"

git log --format='%an <%ae>' | sort -u
git push -u origin ivan/dados-e-riscos
```

## Pull request
**Título:** Camada de dados: Open-Meteo, cache e avaliação de riscos · **Revisor:** Régio
```
O que foi feito
- services/http.js: obterJSON() com cache (memória + localStorage) e validade, junção de pedidos iguais, tempo limite e erros em português.
- services/openMeteo.js: localidades de Moçambique (countryCode=MZ), previsão (últimos 30 dias + 7 dias, num só pedido), várias localidades num só pedido, caudal dos rios (GloFAS) e altitude.
- services/servidor.js: pedidos à função serverless (VITE_API_URL).
- utils/risco.js: risco de cheia (chuva + rio), ciclone/vento (rajadas) e seca (balanço chuva − evaporação em 30 dias).
- Componentes: IndicadorRisco (prop nivel), IconePerigo (ícones animados em SVG), EstadoPedido (carregar/erro/vazio, emite tentar-novamente), CampoPesquisa (v-model + emite pesquisar).
- Composables: usePesquisaCidades, usePrevisaoCidade, useLocalidade.
Como testar: npm run build passa; as páginas usam estes ficheiros nos PRs seguintes.
```

## Explicar na defesa
- **Cache:** previsão 1 h, pesquisa 1 dia, altitude 30 dias → voltar a uma página não gasta dados.
- **`numeroDoPedido`** nos composables: ignora respostas antigas que cheguem atrasadas.
- **`Promise.allSettled`**: previsão e caudal em paralelo; se o caudal falhar, a página funciona na mesma.
- **Seca:** soma a chuva e a evaporação (ET0) dos últimos 30 dias; de Maio a Outubro (época seca) o nível desce um grau.
- Os limiares estão em `LIMIARES` (`utils/risco.js`) e são do grupo, não oficiais do INAM.
