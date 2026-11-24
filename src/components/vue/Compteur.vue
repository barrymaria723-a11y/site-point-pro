<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
const props = defineProps({ valeur: Number });
const n = ref(props.valeur), racine = ref(null);
let io, t;
function jouer() {
  const debut = Date.now();
  clearInterval(t);
  t = setInterval(() => { const p = Math.min(1, (Date.now() - debut) / 1600); n.value = Math.round(props.valeur * (1 - (1 - p) ** 3)); if (p === 1) clearInterval(t); }, 40);
}
onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { io.disconnect(); jouer(); } });
  io.observe(racine.value);
});
onBeforeUnmount(() => { io?.disconnect(); clearInterval(t); });
</script>
<template><strong ref="racine" class="count">{{ n.toLocaleString('fr-FR') }}</strong></template>
