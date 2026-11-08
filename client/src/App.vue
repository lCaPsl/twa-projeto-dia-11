<script setup>
// App.vue — a moldura: navegação + o ecrã da rota atual. · The frame: navigation + the current route's screen.
// Cada entidade acrescenta o seu link aqui. · Each entity adds its link here.
</script>

<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/items">Items</RouterLink>
    <RouterLink to="/pokemon">Pokémon</RouterLink>
    <RouterLink to="/moves">Moves</RouterLink>
    <RouterLink to="/abilities">Abilities</RouterLink>
  </nav>
  <RouterView />
</template>
