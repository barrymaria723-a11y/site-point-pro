<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
const LIENS = [['entreprise', 'L’entreprise'], ['activites', 'Nos activités'], ['briqueterie', 'Briqueterie'], ['tarifs', 'Tarifs'], ['location', 'Location & transport'], ['realisations', 'Réalisations'], ['contact', 'Contact']];
const ouvert = ref(false), actif = ref(''), serre = ref(false);
let sections = [];
// Partie affichée : la dernière dont le haut est passé sous l'en-tête
function suivre() {
  serre.value = scrollY > 40;
  const bas = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
  const vue = sections.filter((s) => s.getBoundingClientRect().top <= innerHeight * 0.35).pop();
  actif.value = bas && sections.length ? 'contact' : vue?.id ?? '';
}
onMounted(() => {
  sections = LIENS.map(([id]) => document.getElementById(id)).filter(Boolean);
  addEventListener('scroll', suivre, { passive: true });
  suivre();
});
onBeforeUnmount(() => removeEventListener('scroll', suivre));
</script>
<template>
  <header class="nav" :class="{ scrolled: serre }">
    <a class="brand" href="/#accueil"><picture><source type="image/avif" srcset="/images/logo-embleme.avif"><img class="brandmark" src="/images/logo-embleme.png" alt="Logo POINT PRO" width="56" height="56"></picture><span>POINT PRO GUINÉE<small>ON CONSTRUIT VOS AMBITIONS</small></span></a>
    <nav id="navlinks" class="navlinks" :class="{ open: ouvert }" aria-label="Navigation principale">
      <a v-for="[id, titre] in LIENS" :key="id" :href="`/#${id}`" :aria-current="actif === id ? 'location' : undefined" @click="ouvert = false">{{ titre }}</a>
    </nav>
    <a class="btn" href="/#contact">Demander un devis ↗</a>
    <button class="menu" type="button" :aria-label="ouvert ? 'Fermer le menu' : 'Ouvrir le menu'" :aria-expanded="ouvert" aria-controls="navlinks" @click="ouvert = !ouvert" @keydown.esc="ouvert = false">
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path v-if="ouvert" d="M6 6l12 12M18 6L6 18" /><path v-else d="M4 7h16M4 12h16M4 17h16" /></svg>
    </button>
  </header>
</template>
