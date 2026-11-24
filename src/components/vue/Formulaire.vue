<script setup>
import { onMounted, reactive, ref, nextTick } from 'vue';
import { useStore } from '@nanostores/vue';
import { $lignes, $total, quantite, initPanier, texteDevis, envoyerWhatsApp } from '../../lib/panier.js';
import { enregistrer } from '../../lib/envoi.js';
import { SERVICES, VILLES, telephoneValide } from '../../lib/choix.js';
import { telephone } from '../../lib/saisie.js';
const f = reactive({ who: 'Particulier', name: '', company: '', phone: '', service: SERVICES[0], city: VILLES[0], need: '', site: '' });
const etat = ref(''), tel = ref(null);
const lignes = useStore($lignes), total = useStore($total), champ = ref(null), pret = ref(false);
onMounted(() => { initPanier(); pret.value = true; });
async function type() { if (f.who === 'Entreprise') { await nextTick(); champ.value?.focus(); } }
function saisirTel(e) {
  tel.value.setCustomValidity('');
  f.phone = e.target.value = telephone(e.target.value);
}
function envoyer() {
  tel.value.setCustomValidity(telephoneValide(f.phone.trim()) ? '' : 'Entrez un numéro de téléphone valide, par exemple 620 00 00 00.');
  if (!tel.value.reportValidity()) return;
  const t = (k) => f[k].trim();
  let msg = 'Bonjour POINT PRO GUINÉE, je souhaite un devis.\nClient : ' + f.who + (f.who === 'Entreprise' ? ` (${t('company')})` : '')
    + `\nNom : ${t('name')}\nTéléphone : ${t('phone')}\nService : ${f.service}\nVille : ${f.city}\nBesoin : ${t('need')}`;
  const devis = texteDevis();
  if (devis) msg += '\n\nProduits :\n' + devis;
  etat.value = '';
  enregistrer({ type: f.who, nom: f.name, entreprise: f.who === 'Entreprise' ? f.company : '', telephone: f.phone.trim(), service: f.service, ville: f.city, besoin: f.need, site: f.site })
    .then((ok) => { etat.value = ok ? 'Votre demande est enregistrée. Envoyez aussi le message WhatsApp pour une réponse plus rapide.' : 'Envoyez bien le message WhatsApp : c’est lui qui nous transmet votre demande.'; });
  envoyerWhatsApp(msg);
}
</script>
<template>
  <form class="form" :class="{ 'is-ent': f.who === 'Entreprise' }" @submit.prevent="envoyer">
    <fieldset class="who"><legend>Vous êtes</legend><div class="who-opts">
      <label v-for="w in ['Particulier', 'Entreprise']" :key="w" class="who-opt"><input v-model="f.who" type="radio" name="who" :value="w" @change="type"><span>{{ w }}</span></label>
    </div></fieldset>
    <div class="field"><label for="name">NOM COMPLET *</label><input id="name" v-model="f.name" required placeholder="Votre nom" autocomplete="name"></div>
    <div v-if="f.who === 'Entreprise'" class="field"><label for="company">NOM DE L’ENTREPRISE *</label><input id="company" ref="champ" v-model="f.company" required placeholder="Raison sociale" autocomplete="organization"></div>
    <div class="field"><label for="phone">TÉLÉPHONE *</label><input id="phone" ref="tel" :value="f.phone" type="tel" inputmode="tel" maxlength="25" @input="saisirTel" required placeholder="Votre numéro" autocomplete="tel"></div>
    <div class="field"><label for="service">SERVICE SOUHAITÉ</label><select id="service" v-model="f.service"><option v-for="s in SERVICES" :key="s">{{ s }}</option></select></div>
    <div id="cityField" class="field"><label for="city">VILLE DU CHANTIER</label><select id="city" v-model="f.city"><option v-for="v in VILLES" :key="v">{{ v }}</option></select></div>
    <div class="field full"><label for="need">DÉCRIVEZ VOTRE BESOIN</label><textarea id="need" v-model="f.need" placeholder="Quantité, type d’engin, date, durée, adresse du chantier…"></textarea></div>
    <Transition name="recap"><div v-if="pret && lignes.length" class="cart-recap">
      <b>Votre devis sera joint à la demande</b>
      <span v-for="i in lignes" :key="i.id">{{ i.nom }} : {{ quantite(i) }}</span>
      <span class="cart-recap-total">Total estimé : {{ total }}</span>
    </div></Transition>
    <input v-model="f.site" class="piege" name="site" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="btn field full" type="submit">Envoyer ma demande sur WhatsApp ↗</button>
    <p v-if="etat" class="etat" role="status">{{ etat }}</p>
    <small>En cliquant, WhatsApp s’ouvrira avec votre demande préremplie. Vous pourrez la vérifier avant l’envoi. Vos coordonnées sont enregistrées par POINT PRO GUINÉE pour traiter votre demande. Écrivez-nous pour les faire supprimer.</small>
  </form>
</template>
