# Télcio — branch `telcio/riscos-e-comunidade`

Página de riscos de uma localidade (rota com parâmetro `/cidade/:id`) e comunidade de vias fechadas e caminhos alternativos.
**Só começar depois de o PR do Ivan estar no `main`.**

## Comandos
```bash
git clone https://github.com/<utilizador-do-ivan>/pwebii-2026-grupo5-chuva-segura.git   # só na 1.ª vez
cd pwebii-2026-grupo5-chuva-segura
git switch main && git pull
git switch -c telcio/riscos-e-comunidade
npm install
```
Copiar o conteúdo de `ficheiros/` (`CidadeView.vue` e `ComunidadeView.vue` **substituem** as provisórias). Testar em `…/#/cidade/1052373` (Beira). Depois, **5 commits**:
```bash
git add src/components/CartaoPerigo.vue src/components/GraficoChuva.vue src/components/CartaoCaudal.vue
git commit -m "Adiciona cartões de perigo, gráfico da chuva e caudal do rio"

git add src/services/comunidade.js src/composables/useRelatos.js src/composables/useFormularioRelato.js
git commit -m "Adiciona serviço e composables dos relatos da comunidade"

git add src/components/CartaoRelato.vue src/components/FormularioRelato.vue
git commit -m "Adiciona cartão e formulário de relato com validação"

git add src/views/CidadeView.vue
git commit -m "Implementa a página de riscos da localidade"

git add src/views/ComunidadeView.vue
git commit -m "Implementa a página de vias e relatos da comunidade"

git log --format='%an <%ae>' | sort -u
git push -u origin telcio/riscos-e-comunidade
```

## Pull request
**Título:** Página de riscos da localidade e comunidade de vias · **Revisor:** Miracle
```
O que foi feito
- CidadeView (/cidade/:id, o parâmetro chega como prop): nível de alerta geral com conselho, cartões de cheia, ciclone/vento e seca, últimos relatos.
- CartaoPerigo (props perigo/aberto, emite "alternar"), GraficoChuva (emite "seleccionar-dia"), CartaoCaudal (mini-gráfico de 37 dias).
- Comunidade: relatar via fechada, zona alagada, ponte danificada, abrigo aberto ou caminho alternativo; confirmar «ainda é verdade»; denunciar e anular a denúncia. Recusa telefones/e-mails/ligações. Expira em 72 h.
- Sem servidor ligado, funciona em modo de demonstração (localStorage).
Como testar: abrir uma cidade → abrir cada perigo; Vias → + Relatar → publicar → confirmar → denunciar → anular.
```

## Explicar na defesa
- **Irmãos que comunicam pelo pai:** o gráfico emite `seleccionar-dia`; a página guarda o dia e passa-o ao gráfico.
- **Cartões que abrem e fecham:** só um aberto de cada vez (`aberto` vem do pai; o filho emite `alternar`).
- **Relatos:** o servidor guarda-os 72 h num Redis; as reacções de cada pessoa ficam no telemóvel para poder anular uma denúncia feita por engano.
