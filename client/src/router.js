// router.js — uma rota por ecrã. Explicado na Aula 06; até lá, só acrescentar linhas como as do exemplo.
// One route per screen. Explained in Aula 06; until then, only add lines like the example ones.
import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home.vue'
import ItemsList from './entities/items/ItemsList.vue'
import ItemDetail from './entities/items/ItemDetail.vue'
import PokemonList from './entities/Pokemon/PokemonList.vue'
import PokemonDetail from './entities/Pokemon/PokemonDetail.vue'
import PokemonSearch from './entities/Pokemon/PokemonSearch.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  // entidade de exemplo · example entity — list + detail
  { path: '/items', name: 'items-list', component: ItemsList },
  { path: '/items/:id', name: 'item-detail', component: ItemDetail },
  // Pokémon — named routes match screen components (easier DevTools / debug)
  { path: '/pokemon', name: 'pokemon-list', component: PokemonList },
  { path: '/pokemon/search', name: 'pokemon-search', component: PokemonSearch },
  { path: '/pokemon/:name', name: 'pokemon-detail', component: PokemonDetail },
]

export default createRouter({ history: createWebHistory(), routes })
