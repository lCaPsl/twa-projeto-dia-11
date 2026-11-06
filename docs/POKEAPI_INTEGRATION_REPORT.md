# PokeAPI Integration Report

## Summary

Vue 3 + Vite app. Pokémon data comes **only** from PokeAPI in the browser.

We kept the existing pattern (`entities/Pokemon/` + shared `getJSON`). No database, backend, new libraries, or design rewrite.

**What works:** paginated list, detail by name/ID, search form, loading/error/empty states, `manage` launcher, mocked API tests, production build.

## How it fits together

```text
UI (List / Search / Detail)
   → Pokemon/api.js   (URLs, parseKey, parse response)
   → getJSON.js       (fetch, timeout, abort, HTTP/JSON errors)
   → PokeAPI
```

| What | Where |
|------|--------|
| Base URL + `list` / `get` | `entities/Pokemon/api.js` (facade) → `api/config.js`, `api/listPokemon.js`, `api/getPokemon.js`, … |
| HTTP | `api/getJSON.js` |
| Screens | `PokemonList`, `PokemonDetail`, `PokemonSearch` |
| Routes | `/pokemon`, `/pokemon/search`, `/pokemon/:name` |

## Security (short)

- Fixed base URL — user input is never a URL.
- `parseKey` cleans name/ID before any request; bad input is rejected.
- Path is `encodeURIComponent`’d.
- Page size capped (max 50).
- Only https sprites from known hosts.
- UI uses text binding (no `v-html`).
- Abort + 10s timeout avoid stale/hanging requests.

## Naming

| Name | Meaning |
|------|---------|
| `list` / `get` / `parseKey` | Same idea as Items: list, one item, clean input |
| `pokemons` / `total` | List state (not `items`) |
| `/pokemon/search` | Find by name or ID (`PokemonSearch.vue` — M1 form screen) |
| `:name` | Route key — name **or** numeric ID |

## Files touched

- Modified: `getJSON.js`, `Pokemon/api.js`, `router.js`, `App.vue`, `Home.vue`, `package.json`, `README.md`
- Added: `PokemonList.vue`, `PokemonDetail.vue`, `PokemonSearch.vue`, `scripts/test-pokemon-api.mjs`, `manage.sh`, `manage.cmd`, this report

Items example left as-is.

## Run

```sh
manage.cmd dev          # Windows
./manage.sh dev         # Git Bash / WSL / macOS / Linux
cd client && npm run manage
```

Also: `manage.cmd test` · `manage.cmd build` · `manage.cmd help`

App: `http://localhost:5173` — `/pokemon`, `/pokemon/search`, `/pokemon/pikachu`

## Tests & build

| Check | Result |
|-------|--------|
| `npm run test:pokemon-api` | PASS (mocked fetch — security & stability cases) |
| `npm run build` | PASS |
| ESLint | Not configured in this repo |
| Live PokeAPI e2e | Manual only (`manage` / `dev`) |

## Limits

- List is not free-text search — use Search for name/ID.
- No offline cache.
- For M2, change URLs only in `Pokemon/api.js`.

## Checklist

- [x] Existing Vue/JS architecture kept  
- [x] Data from PokeAPI only  
- [x] One place for Pokémon URLs + shared HTTP  
- [x] List, detail, search  
- [x] Input validation, abort, timeout  
- [x] `manage` launcher  
- [x] Build + mocked tests  
