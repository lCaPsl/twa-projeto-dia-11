# TWA 2026/27 — projeto · project template

**Tecnologias Web Avançadas** · Licenciatura em Engenharia Informática · ISLA Gaia · 2026/27 · David Vaz ([@davidmgvaz](https://github.com/davidmgvaz))

**PT** — Repositório inicial do projeto de grupo. Cria o vosso a partir dele com **Use this template** (nome `twa-projeto-<dia|noite>-<nn>`, **privado**, com `davidmgvaz` como colaborador) e preencham a secção **Grupo** abaixo até **domingo 18/10**.
**EN** — Starter repository for the group project. Create yours from it with **Use this template** (name it `twa-projeto-<dia|noite>-<nn>`, **private**, with `davidmgvaz` as collaborator) and fill in the **Group** section below by **Sunday 18/10**.

## Grupo · Group

**Turma:** Dia / Noite

| Membro · Member | Nº | Entidade · Entity | Endpoints da API pública (lista · um item) · Public API endpoints (list · one item) |
|---|---|---|---|
|   Tiago Leite   | 22508572 | Pokémon | `https://pokeapi.co/api/v2/pokemon/` |
|   Pedro Silva   | 22311779 | Trainer | … |
|   Diego Vilela   |  | Tournament | … |
|   Elber António   | 22507915 | Team | … |

**Uma entidade por membro**, de ponta a ponta: ecrãs Vue (M1), modelo e endpoints (M2), secção do relatório (M3) — e as perguntas da parte B do teste são sobre *a tua* entidade. · **One entity per member**, end to end: Vue screens (M1), model and endpoints (M2), report section (M3) — and your part B test questions are about *your* entity.

## Tema · Theme

| | |
|---|---|
| **Tema · Theme** | Pokédex & teams |
| **API pública (M1) · Public API (M1)** | PokéApi |
| **URL base da API · API base URL** | `https://pokeapi.co/api/v2/` |
| **Entidades (uma por membro) · Entities (one per member)** | Pokémon · Trainer · Team · Tournament |

Temas propostos (documentação · URL base) · Proposed themes (docs · base URL):

| Tema · Theme | Entidades · Entities | API pública (M1) · Public API (M1) |
|---|---|---|
| Pokédex e equipas · Pokédex & teams | Pokémon · Treinador/Trainer · Equipa/Team · Torneio/Tournament · Troca/Trade | [PokéAPI](https://pokeapi.co/) · `https://pokeapi.co/api/v2/` |
| Séries de TV · TV series | Série/Series · Episódio/Episode · Ator/Actor · Watchlist · Review | [TVMaze](https://www.tvmaze.com/api) · `https://api.tvmaze.com/` |
| Biblioteca · Library | Livro/Book · Autor/Author · Leitor/Reader · Empréstimo/Loan · Editora/Publisher | [Open Library](https://openlibrary.org/developers/api) · `https://openlibrary.org/` |
| Receitas · Recipes | Receita/Recipe · Ingrediente/Ingredient · Categoria/Category · Plano semanal/Weekly plan · Utilizador/User | [TheMealDB](https://www.themealdb.com/api.php) · `https://www.themealdb.com/api/json/v1/1/` |
| Museu · Museum | Obra/Artwork · Artista/Artist · Exposição/Exhibition · Coleção/Collection · Visitante/Visitor | [Art Institute of Chicago](https://api.artic.edu/docs/) · `https://api.artic.edu/api/v1/` |
| Meteorologia local · Local weather | Cidade/City · Estação/Station · Observação/Observation · Alerta/Alert · Utilizador/User | [Open-Meteo](https://open-meteo.com/en/docs) · `https://api.open-meteo.com/v1/` |
| Música · Music | Artista/Artist · Álbum/Album · Faixa/Track · Playlist · Utilizador/User | [MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_API) · `https://musicbrainz.org/ws/2/` |
| Lançamentos espaciais · Space launches | Lançamento/Launch · Foguetão/Rocket · Agência/Agency · Missão/Mission · Plataforma/Pad | [Launch Library 2](https://ll.thespacedevs.com/docs/) · `https://ll.thespacedevs.com/2.3.0/` (15 pedidos/hora · 15 requests/hour) |
| Desporto · Sports | Equipa/Team · Jogador/Player · Jogo/Match · Liga/League · Época/Season | [TheSportsDB](https://www.thesportsdb.com/free_sports_api) · `https://www.thesportsdb.com/api/v1/json/3/` (chave de teste `3` · test key `3`) |

**PT** — Escolham um tema da lista publicada no Moodle (*Temas do projeto*) ou proponham o vosso. Um tema próprio é aceite se a API pública **permitir CORS** e **não exigir chave**: ao entregar o URL do repositório no Moodle, escrevam o nome do tema e o URL da API no texto online da entrega; o docente aprova ou recusa no comentário de feedback. Até à aprovação, não contem com o tema.
**EN** — Pick a theme from the list published on Moodle (*Project themes*) or propose your own. An own theme is accepted if the public API **allows CORS** and **needs no key**: when submitting the repository URL on Moodle, write the theme name and the API URL in the submission's online text; the lecturer approves or refuses it in the feedback comment. Do not count on the theme until it is approved.

## Como correr · How to run

```sh
cd client
npm install
npm run dev          # http://localhost:5173
```

Requisitos · Requirements: Node.js 22 LTS, npm 10, Git.

## Estrutura · Structure

```
client/                      frontend Vue 3 + Vite + Vue Router (M1)
├── src/
│   ├── main.js              createApp(App).use(router).mount('#app')
│   ├── App.vue              navegação + <RouterView> · navigation + <RouterView>
│   ├── router.js            uma rota por ecrã (Aula 06) · one route per screen
│   ├── Home.vue             página inicial: tema, grupo · home page: theme, group
│   ├── api/getJSON.js       o fetch das fichas: res.ok + JSON · the fetch from the fichas
│   └── entities/
│       └── items/           ENTIDADE DE EXEMPLO · EXAMPLE ENTITY (apagar depois · delete afterwards)
│           ├── api.js       os URLs desta entidade, e só aqui · this entity's URLs, nowhere else
│           ├── ItemsList.vue
│           └── ItemDetail.vue
└── public/data/items.json   dados do exemplo · example data
server/                      API Express + MongoDB — a partir da Aula 08 (M2) · from Aula 08 (M2)
```

**Regra: uma pasta por entidade** em `client/src/entities/<entidade>/`, com `api.js`, `<Entidade>List.vue`, `<Entidade>Detail.vue` e, no M1, `<Entidade>Form.vue`. As rotas da entidade entram no `router.js` e o link na `App.vue` — ver os comentários. · **Rule: one folder per entity** in `client/src/entities/<entity>/`, with `api.js`, `<Entity>List.vue`, `<Entity>Detail.vue` and, for M1, `<Entity>Form.vue`. The entity's routes go in `router.js` and its link in `App.vue` — see the comments there.

## Calendário · Calendar

| Marco · Milestone | O quê · What | Peso · Weight | Prazo · Deadline |
|---|---|---|---|
| **M1** | Vue sobre a API pública: lista, detalhe, formulário, routing — um ecrã por membro · Vue over the public API: list, detail, form, routing — one screen per member | 10% | dom. · Sun 08/11/2026 |
| **M2** | API própria Node + Express + MongoDB — uma entidade por membro, com relações; o frontend passa a usá-la · your own API — one entity per member, with relations; the frontend switches to it | 15% | dom. · Sun 06/12/2026 |
| **M3** | PWA + Canvas + relatório ≤ 2 páginas + apresentação no workshop de 14/01 · PWA + Canvas + report ≤ 2 pages + presentation at the 14/01 workshop | 15% | dom. · Sun 17/01/2027 |

**IA generativa · Generative AI:** permitida no projeto com **declaração obrigatória** no README e no relatório (o que, onde, como foi verificado). · allowed in the project with a **mandatory declaration** in the README and the report (what, where, how it was checked).

## Declaração de IA · AI declaration

…
