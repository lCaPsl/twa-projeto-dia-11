<script setup>
// PokemonDetail.vue — simple detail layout (nav palette, no fill backgrounds).
defineOptions({ name: 'PokemonDetail' })

import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import {
  get,
  formatId,
  formatName,
  heightMeters,
  weightKg,
} from './api.js'
import { pokeLog, pokeWarn } from './api/debug.js'

const route = useRoute()
const status = ref('loading')
const error = ref(null)
const pokemon = ref(null)
let abort = null

async function load() {
  abort?.abort()
  abort = new AbortController()
  const signal = abort.signal
  status.value = 'loading'
  error.value = null
  pokemon.value = null
  pokeLog('ui:detail-load', { path: route.fullPath, name: route.params.name })
  try {
    pokemon.value = await get(route.params.name, { signal })
    if (signal.aborted) {
      pokeLog('ui:detail-aborted')
      return
    }
    status.value = 'ready'
    pokeLog('ui:detail-ready', {
      id: pokemon.value.id,
      name: pokemon.value.name,
      evolutions: pokemon.value.evolutions?.length,
    })
  } catch (err) {
    if (err?.name === 'AbortError' || signal.aborted) {
      pokeLog('ui:detail-aborted')
      return
    }
    status.value = 'error'
    if (err.message === 'HTTP 404') error.value = `Pokémon "${route.params.name}" not found`
    else error.value = err.message || 'Request failed'
    pokeWarn('ui:detail-error', error.value)
  }
}

watch(
  () => route.params.name,
  (name) => {
    pokeLog('ui:detail-route', { name })
    load()
  },
  { immediate: true },
)
onBeforeUnmount(() => abort?.abort())
</script>

<template>
  <p class="back"><RouterLink to="/pokemon">← Pokémon</RouterLink></p>

  <p v-if="status === 'loading'" class="status">Loading…</p>
  <p v-else-if="status === 'error'" class="status">
    Error: {{ error }} <button type="button" @click="load">Retry</button>
  </p>

  <article v-else class="detail">
    <header class="hero">
      <div class="hero-left">
        <h2 class="title">{{ formatName(pokemon.name) }}</h2>
        <div class="sprites">
          <img v-if="pokemon.sprite" :src="pokemon.sprite" :alt="formatName(pokemon.name)" />
          <img
            v-if="pokemon.spriteShiny"
            :src="pokemon.spriteShiny"
            :alt="formatName(pokemon.name) + ' shiny'"
          />
        </div>
      </div>

      <div class="hero-right">
        <div class="hero-meta">
          <span class="id">{{ formatId(pokemon.id) }}</span>
          <span v-for="t in pokemon.types" :key="t" class="tag">{{ formatName(t) }}</span>
        </div>

        <p v-if="pokemon.description" class="desc">{{ pokemon.description }}</p>

        <dl class="attrs">
          <dt>Height</dt><dd>{{ heightMeters(pokemon.height) }}</dd>
          <dt>Weight</dt><dd>{{ weightKg(pokemon.weight) }}</dd>
          <dt>Catch Rate</dt>
          <dd v-if="pokemon.captureRate != null">{{ pokemon.captureRate }} ({{ pokemon.catchPercent }}%)</dd>
          <dd v-else>—</dd>
          <dt>Gender</dt>
          <dd v-if="pokemon.gender.genderless">Genderless</dd>
          <dd v-else>♂ {{ pokemon.gender.male }}% · ♀ {{ pokemon.gender.female }}%</dd>
        </dl>

        <p v-if="pokemon.weaknesses.length" class="weak">
          <span class="label">Weakness</span>
          <span v-for="w in pokemon.weaknesses" :key="w" class="tag">{{ formatName(w) }}</span>
        </p>
      </div>
    </header>

    <div class="grid">
      <section>
        <h3>Evolutions</h3>
        <div class="evo">
          <template v-for="(evo, i) in pokemon.evolutions" :key="evo.name">
            <RouterLink
              class="evo-item"
              :class="{ current: evo.name === pokemon.name }"
              :to="`/pokemon/${evo.name}`"
            >
              <img v-if="evo.sprite" :src="evo.sprite" :alt="formatName(evo.name)" />
              <span>{{ evo.form === 'mega' ? 'Mega' : formatName(evo.name) }}</span>
              <small v-if="evo.form === 'mega'">{{ formatName(evo.name.replace(/-mega.*$/, '')) }}</small>
              <small v-else-if="i > 0 && evo.minLevel != null">Level {{ evo.minLevel }}</small>
            </RouterLink>
            <span v-if="i < pokemon.evolutions.length - 1" class="evo-arrow" aria-hidden="true">→</span>
          </template>
        </div>
      </section>

      <section>
        <h3>Base Stats</h3>
        <ul class="stats">
          <li v-for="s in pokemon.stats" :key="s.key">
            <span class="stat-label">{{ s.label }}</span>
            <span class="stat-value">{{ s.value }}</span>
          </li>
        </ul>
        <p class="total"><span>Total</span><strong>{{ pokemon.statsTotal }}</strong></p>
      </section>
    </div>
  </article>
</template>

<style scoped>
/* Palette from global nav: text #222, accent #5b1f2e, muted #666, line #ddd */
.back { margin-bottom: .75rem; }
.back a,
.evo-item,
.detail a { color: #5b1f2e; text-decoration: none; }
.back a:hover,
.evo-item:hover { text-decoration: underline; }

.detail { display: flex; flex-direction: column; gap: 1.5rem; }

.hero {
  display: grid;
  grid-template-columns: minmax(140px, 200px) 1fr;
  gap: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.title { margin: 0 0 .5rem; font-size: 1.5rem; text-align: center; color: #222; }
.sprites { display: flex; justify-content: center; gap: .25rem; }
.sprites img { width: 96px; height: 96px; image-rendering: pixelated; }

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .5rem .75rem;
  margin-bottom: .75rem;
}
.id { color: #666; font-weight: 600; }

.tag {
  color: #5b1f2e;
  border: 1px solid #ddd;
  border-radius: 999px;
  padding: .15rem .55rem;
  font-size: .8rem;
}


.desc {
  margin: 0 0 1rem;
  padding-left: .75rem;
  border-left: 2px solid #5b1f2e;
  color: #666;
  line-height: 1.45;
}

.attrs {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: .25rem 1rem;
  margin: 0 0 .85rem;
}
.attrs dt { color: #666; }
.attrs dd { margin: 0; color: #222; }

.weak { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; margin: 0; }
.weak .label { font-size: .8rem; color: #666; font-weight: 600; margin-right: .15rem; }

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.grid h3 {
  margin: 0 0 .75rem;
  font-size: 1.05rem;
  color: #222;
  padding-bottom: .35rem;
  border-bottom: 1px solid #ddd;
}

.evo { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem .5rem; }
.evo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .25rem;
  padding: .35rem;
  min-width: 5rem;
}
.evo-item.current { font-weight: 600; text-decoration: underline; }
.evo-item img { width: 64px; height: 64px; image-rendering: pixelated; }
.evo-item small { color: #666; }
.evo-arrow { color: #666; }

.stats { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
.stats li {
  display: grid;
  grid-template-columns: 1fr max-content;
  gap: .5rem;
  align-items: baseline;
  padding: .25rem 0;
  border-bottom: 1px solid #ddd;
}
.stat-label { font-size: .85rem; color: #666; }
.stat-value { font-weight: 600; font-size: .85rem; color: #222; }
.total {
  display: flex;
  justify-content: space-between;
  margin: .85rem 0 0;
  padding-top: .65rem;
  border-top: 1px solid #ddd;
  color: #222;
}

@media (max-width: 720px) {
  .hero { grid-template-columns: 1fr; }
  .title { text-align: left; }
  .sprites { justify-content: flex-start; }
  .grid { grid-template-columns: 1fr; }
}
</style>
