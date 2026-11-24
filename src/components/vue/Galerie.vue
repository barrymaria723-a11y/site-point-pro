<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
// classe : mise en page de la galerie. images : { src, alt, texte, gras?, grand?, style? }
const props = defineProps({ classe: String, images: Array, catalogue: Boolean });
const cur = ref(-1), boite = ref(null);
let retour = null, sx = 0;
const avif = (s) => `/images/${s.replace(/\.\w+$/, '')}.avif`;
const jpg = (s) => `/images/${s}`;
function ouvrir(i, e) { retour = e.currentTarget; cur.value = i; }
function fermer() { cur.value = -1; }
const aller = (d) => { cur.value = (cur.value + d + props.images.length) % props.images.length; };
function clavier(e) {
  if (e.key === 'Escape') fermer(); else if (e.key === 'ArrowLeft') aller(-1); else if (e.key === 'ArrowRight') aller(1);
  else if (e.key === 'Tab') {
    const b = [...boite.value.querySelectorAll('button')];
    const i = b.indexOf(document.activeElement);
    e.preventDefault(); b[(i + (e.shiftKey ? b.length - 1 : 1)) % b.length].focus();
  }
}
watch(cur, async (v, avant) => {
  if (v >= 0 && avant < 0) { document.body.style.overflow = 'hidden'; document.addEventListener('keydown', clavier); await nextTick(); boite.value?.querySelector('.lb-close').focus(); }
  if (v < 0 && avant >= 0) { document.body.style.overflow = ''; document.removeEventListener('keydown', clavier); retour?.focus(); }
});
onBeforeUnmount(() => document.removeEventListener('keydown', clavier));
</script>
<template>
  <div :class="classe">
    <a v-for="(im, i) in images" :key="im.src" class="zoomable" :class="{ big: im.grand, 'cat-doc': catalogue }" :href="jpg(im.src)" target="_blank" rel="noopener" :aria-label="`Agrandir : ${im.gras ? im.gras + ' ' : ''}${im.texte}`" @click.prevent="ouvrir(i, $event)">
      <picture><source type="image/avif" :srcset="avif(im.src)"><img :src="jpg(im.src)" :alt="im.alt" loading="lazy" :style="im.style"></picture>
      <span v-if="catalogue"><b>{{ im.texte }}</b><span>Voir la page complète ↗</span></span>
      <span v-else class="cap"><b v-if="im.gras">{{ im.gras }}</b>{{ im.gras ? ' · ' : '' }}{{ im.texte }}</span>
    </a>
  </div>
  <Teleport v-if="cur >= 0" to="body">
    <div ref="boite" class="lb open" role="dialog" aria-modal="true" aria-label="Visionneuse de photos" @click.self="fermer" @touchstart.passive="sx = $event.touches[0].clientX" @touchend="Math.abs($event.changedTouches[0].clientX - sx) > 50 && aller($event.changedTouches[0].clientX < sx ? 1 : -1)">
      <span class="lb-count">{{ cur + 1 }} / {{ images.length }}</span>
      <figure :key="cur"><img :src="catalogue ? jpg(images[cur].src) : avif(images[cur].src)" :alt="images[cur].alt" @error="$event.target.src.endsWith('.avif') && ($event.target.src = jpg(images[cur].src))"><figcaption>{{ images[cur].gras ? images[cur].gras + ' · ' : '' }}{{ images[cur].texte }}</figcaption></figure>
      <button class="lb-close" type="button" aria-label="Fermer" @click="fermer"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
      <button class="lb-prev" type="button" aria-label="Photo précédente" @click="aller(-1)"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6" /></svg></button>
      <button class="lb-next" type="button" aria-label="Photo suivante" @click="aller(1)"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg></button>
    </div>
  </Teleport>
</template>
