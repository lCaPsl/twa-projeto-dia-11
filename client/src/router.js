// router.js — uma rota por ecrã. Explicado na Aula 06; até lá, só acrescentar linhas como as do exemplo.
// One route per screen. Explained in Aula 06; until then, only add lines like the example ones.
import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home.vue'
import ItemsList from './entities/items/ItemsList.vue'
import ItemDetail from './entities/items/ItemDetail.vue'
import ItemNew from './entities/items/ItemNew.vue'
import PokemonList from './entities/Pokemon/PokemonList.vue'
import PokemonDetail from './entities/Pokemon/PokemonDetail.vue'
import PokemonSearch from './entities/Pokemon/PokemonSearch.vue'
import AbilitiesList from './entities/abilities/AbilitiesList.vue'
import AbilityDetail from './entities/abilities/AbilityDetail.vue'
import AbilityNew from './entities/abilities/AbilityNew.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  // Items (Diego) — /items/new tem de vir antes de /items/:id · /items/new must come before /items/:id
  { path: '/items', name: 'items-list', component: ItemsList },
  { path: '/items/new', name: 'item-new', component: ItemNew },
  { path: '/items/:id', name: 'item-detail', component: ItemDetail },
  // Pokémon — named routes match screen components (easier DevTools / debug)
  { path: '/pokemon', name: 'pokemon-list', component: PokemonList },
  { path: '/pokemon/search', name: 'pokemon-search', component: PokemonSearch },
  { path: '/pokemon/:name', name: 'pokemon-detail', component: PokemonDetail },
  // Abilities (Elber) — /abilities/new antes de /abilities/:id · /abilities/new before /abilities/:id
  { path: '/abilities', name: 'abilities-list', component: AbilitiesList },
  { path: '/abilities/new', name: 'ability-new', component: AbilityNew },
  { path: '/abilities/:id', name: 'ability-detail', component: AbilityDetail },
]

export default createRouter({ history: createWebHistory(), routes })
