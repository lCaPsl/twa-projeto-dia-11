<script setup>
// Home.vue — página inicial do projeto: tema, API usada, membros e entidades.
// Project home page: theme, API used, members and entities.
const members = [
  { name: 'Tiago Leite', nr: '22508572', entity: 'Pokémon', to: '/pokemon' },
  { name: 'Pedro Silva', nr: '22311779', entity: 'Moves', to: null },
  { name: 'Diego Vilela', nr: '22505041', entity: 'Items', to: '/items' },
  { name: 'Elber António', nr: '22507915', entity: 'Abilities', to: null },
]
</script>

<template>
  <h1>TWA · projeto</h1>
  <p>Tema · Theme: <em>Pokédex &amp; teams</em></p>
  <p>
    API pública · Public API:
    <a href="https://pokeapi.co/" target="_blank" rel="noopener">PokéAPI</a>
    (<code>https://pokeapi.co/api/v2/</code>)
  </p>

  <h2>Grupo · Group</h2>
  <table>
    <thead>
      <tr><th>Membro · Member</th><th>Nº</th><th>Entidade · Entity</th></tr>
    </thead>
    <tbody>
      <tr v-for="m in members" :key="m.nr">
        <td>{{ m.name }}</td>
        <td>{{ m.nr }}</td>
        <td>
          <RouterLink v-if="m.to" :to="m.to">{{ m.entity }}</RouterLink>
          <template v-else>{{ m.entity }}</template>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table { border-collapse: collapse; }
th, td { text-align: left; padding: .35rem .9rem; border-bottom: 1px solid #ddd; }
</style>
