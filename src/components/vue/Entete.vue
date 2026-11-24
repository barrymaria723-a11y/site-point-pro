<script setup>
import { ref } from 'vue';
defineProps({ page: String });
const LIENS = [['entreprise', 'L’entreprise'], ['activites', 'Nos activités'], ['briqueterie', 'Briqueterie'], ['tarifs', 'Tarifs'], ['location-transport', 'Location & transport'], ['realisations', 'Réalisations'], ['contact', 'Contact']];
const ouvert = ref(false);
</script>
<template>
  <header class="nav">
    <a class="brand" href="/"><picture><source type="image/avif" srcset="/images/logo-embleme.avif"><img class="brandmark" src="/images/logo-embleme.png" alt="Logo POINT PRO" width="56" height="56"></picture><span>POINT PRO GUINÉE<small>ON CONSTRUIT VOS AMBITIONS</small></span></a>
    <nav id="navlinks" class="navlinks" :class="{ open: ouvert }" aria-label="Navigation principale">
      <a v-for="[id, titre] in LIENS" :key="id" :href="`/${id}.html`" :aria-current="page === id ? 'page' : undefined" @click="ouvert = false">{{ titre }}</a>
    </nav>
    <a class="btn" href="/contact.html">Demander un devis ↗</a>
    <button class="menu" type="button" :aria-label="ouvert ? 'Fermer le menu' : 'Ouvrir le menu'" :aria-expanded="ouvert" aria-controls="navlinks" @click="ouvert = !ouvert" @keydown.esc="ouvert = false">
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path v-if="ouvert" d="M6 6l12 12M18 6L6 18" /><path v-else d="M4 7h16M4 12h16M4 17h16" /></svg>
    </button>
  </header>
</template>
