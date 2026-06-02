# Sicília Orientale · Guias Interativos

Portal estilo *wiki/dashboard* que reúne os guias interativos da **Sicília Oriental**, com uma **home** de panorama regional e **abas** por cidade.

🌍 **Ao vivo:** https://thiagoflc.github.io/guia-sicily/

## Cidades

| Cidade | Guia | Paragens |
|---|---|---|
| **Ortigia** (Siracusa) | `ortigia.html` | 41 · 5 atos |
| **Noto** | `noto.html` | 8 · 3 atos |
| **Ragusa** | `ragusa.html` | 10 · 4 atos |

A **home** (`index.html`) traz o resumo da Sicília Oriental, um mapa regional com as três cidades e cards de seleção.

## Estrutura

Multi-página estática, unificada por uma barra de navegação compartilhada (Home · Ortigia · Noto · Ragusa):

```
index.html      → home (panorama + mapa regional + cards)
ortigia.html    → guia de Ortigia
noto.html       → guia de Noto
ragusa.html     → guia de Ragusa
```

Cada guia é *self-contained*: mapa interativo claro (Leaflet + CartoDB Positron com filtro cobre), timeline com scroll-spy, modais glassmorphism acessíveis e rota no Google Maps por ponto.

## Stack

HTML5 · Tailwind CSS (pré-compilado) · Alpine.js (+ plugin focus) · Leaflet — sem build em runtime.

## Acessibilidade

Cards operáveis por teclado, modais `role="dialog"` com *focus trap*, contraste WCAG AA, `prefers-reduced-motion`, web-app instalável (mobile-first, iPhone Pro Max).

## Créditos

Todas as fotografias são reais e de licença livre via **Wikimedia Commons** — autoria e licença na seção "Créditos das imagens" de cada guia. Mapas © OpenStreetMap · © CARTO.

## Rodar localmente

```bash
npx serve .
```
