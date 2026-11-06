<script setup>
// Home.vue — página inicial do projeto: tema, grupo, entidades.
// Project home page: theme, group, entities.
</script>

<template>
  <h1>TWA · projeto</h1>
  <p>Tema · Theme: <em>Pokédex &amp; teams</em></p>
  <ul>
    <li><RouterLink to="/pokemon">Pokémon</RouterLink> — list, detail, search</li>
    <li><RouterLink to="/items">Items</RouterLink> — entidade de exemplo · example entity</li>
  </ul>
</template>
