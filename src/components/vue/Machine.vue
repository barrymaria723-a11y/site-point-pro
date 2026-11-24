<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
const MOTS = ['vos parpaings', 'vos engins', 'votre ciment', 'vos ambitions'];
const texte = ref(MOTS[3]);
let t;
onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let m = 0, c = 0, efface = false, pause = 0;
  t = setInterval(() => {
    if (pause) { pause--; return; }
    if (!efface) { if (c < MOTS[m].length) c++; else { efface = true; pause = 22; } }
    else if (c > 0) c--; else { efface = false; pause = 4; m = (m + 1) % MOTS.length; }
    texte.value = MOTS[m].slice(0, c);
  }, 85);
});
onBeforeUnmount(() => clearInterval(t));
</script>
<template><p class="typed-line">Nous livrons <span>{{ texte }}</span><i class="caret" aria-hidden="true"></i></p></template>
