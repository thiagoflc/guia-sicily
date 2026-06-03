# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Portal estático **multi-página** de guias turísticos interativos da Sicília Oriental (PT-BR), com estética *quiet luxury* escura. Uma **home** (`index.html`) com panorama regional + mapa + cards, e uma página por cidade: `ortigia.html`, `noto.html`, `ragusa.html`, `modica.html`. Publicado via **GitHub Pages** a partir de `main`: https://thiagoflc.github.io/guia-sicily/

## Rodar e verificar

Não há build, bundler, testes nem lint. Cada `.html` é autossuficiente.

```bash
npx serve .            # ou: python3 -m http.server 8099
```

Para validar uma alteração antes de commitar (não há suíte de testes):
- Sirva a pasta e abra a página no navegador; confira mapa, timeline (scroll-spy) e modal.
- A lógica de cada guia fica num `<script>` inline — extraia e rode `node --check` para pegar erro de sintaxe.
- Imagens são URLs do Wikimedia Commons (`Special:FilePath`): confirme HTTP 200 (a Commons aplica rate-limit 429 — reespace as requisições com `sleep`, não confunda com 404).

## Arquitetura

Cada página de cidade é uma **SPA single-file** com a MESMA arquitetura (clonada entre arquivos), sem dependências locais — tudo via CDN:

- **Tailwind** pré-compilado e **inline** num `<style>` gigante (não há runtime/CDN do Tailwind). **Classes novas do Tailwind não existem** nesse CSS compilado — para estilos fora do conjunto já presente, use CSS inline ou as classes utilitárias já compiladas no arquivo.
- **Alpine.js** (+ plugin `focus`) e **Leaflet** via unpkg.
- App-shell que **não rola**: mapa fixo no topo + *bottom sheet* rolável (timeline). Mapa e sheet sincronizam por **scroll-spy** (IntersectionObserver) ↔ **flyTo**.

### Modelo de dados (o coração de cada guia)

No `<script>` final: `const DB = { centro:[lat,lng], atos:[ { id, faixa, titulo, pontos:[ ... ] } ] }`, consumido por um componente Alpine `function <cidade>Guide()` referenciado em `<body x-data="<cidade>Guide()">`.

Cada **ponto** tem `tipo` que governa render e interação:
- `base` (losango dourado), `foco` (esmeralda), `food` (bordô) → card grande com imagem; **abrem modal** (descrição, história, insights, custo, duração, horário ideal).
- `peripheral` (ponto discreto) → sem imagem/modal; clicar apenas centraliza o mapa.

Campos do ponto: `id, tipo, nome, ato, hora, coord:[lat,lng], linha, img, custo, duracao, horarioIdeal, descricao, historia, insights:[]`. `coord` alimenta os marcadores do mapa. **`placeId` (opcional)** torna o link do Google Maps cirúrgico — `gmapsUrl()` linka pelo NOME do ponto + cidade (`${p.nome}, <Cidade>`) e, se houver `placeId`, usa `query_place_id`; coordenadas NÃO entram no link (podem cair fora do POI real).

### Navegação compartilhada (cuidado: duplicada em cada arquivo)

A navbar `.sicily-nav` (Home · Ortigia · Noto · Ragusa · Modica) é **copiada em todas as páginas** — seu CSS e markup vivem dentro de cada `.html`, não há include. A cidade ativa usa `class="nav-tab nav-tab--active" aria-current="page"`. O conteúdo é deslocado pela navbar via `--navh` (regras `#map`, `body > header`, `.veil`, `.sheet-wrap` com `!important`).

### Adicionar uma cidade nova

1. `cp` de uma página existente (ex.: `ragusa.html`) → `<cidade>.html` para herdar a arquitetura, navbar, offsets e `gmapsUrl`.
2. Trocar: `<title>`/meta, `apple-mobile-web-app-title`, `x-data` + nome da função `<cidade>Guide()`, cidade no `gmapsUrl` (`${p.nome}, <Cidade>`), `aria-label` do mapa, `activeLabel` inicial, textos do header/intro/fecho, créditos das imagens, e o `DB` inteiro (centro + atos/pontos).
3. **Em TODAS as páginas**: inserir a aba `<a href="<cidade>.html" class="nav-tab">…</a>` na `.sicily-nav` (ativa só na própria página).
4. Em `index.html`: adicionar o `.city-card`, a entrada no array do `#region-map` (`{ nome, href, coord }`) e atualizar a contagem de cidades no texto.

## Convenções

- **Imagens reais e de licença livre** apenas (Wikimedia Commons), creditadas na seção "Créditos das imagens" de cada guia.
- Mapa claro: Leaflet + CartoDB Positron com filtro sépia/cobre; respeita `prefers-reduced-motion` (sem `flyTo` animado).
- Acessibilidade é requisito: alvos ≥44px, modal `role="dialog"` com focus-trap, navegação por teclado, contraste AA, mobile-first (iPhone Pro Max, `dvh`, safe areas).
- A "jornada" de cada guia é narrativa (atos temáticos com drama/história/geologia) — conteúdo curado, sem encheção turística.
