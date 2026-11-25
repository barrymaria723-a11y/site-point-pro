// Devis partagé entre les composants React et Vue
import { atom, computed } from 'nanostores';
import { produit, gnf, nombre } from './produits.js';
import { suivre } from './audience.js';

const CLE = 'pp-devis', JOURS = 7;
export const $panier = atom([]); // [{ id, q }]
export const $ouvert = atom(null); // null = fermé, '' = ouvert, 'id' = ouvert sur ce produit

export const $lignes = computed($panier, (items) => items.map((i) => ({ ...produit(i.id), q: i.q })));
export const $total = computed($lignes, (l) => {
  const t = l.reduce((s, i) => s + i.prix * i.q, 0);
  return t ? gnf(t) + (l.some((i) => !i.prix) ? ' + articles à chiffrer' : '') : 'Prix à discuter';
});
export const quantite = (i) => nombre(i.q) + (i.m2 ? ' m²' : '');

function lire() {
  try {
    const d = JSON.parse(localStorage.getItem(CLE));
    if (!d || Date.now() - d.t > JOURS * 864e5) return [];
    return d.items.filter((i) => i && typeof i.id === 'string' && produit(i.id) && i.q > 0 && Number.isFinite(i.q)).map(({ id, q }) => ({ id, q }));
  } catch { return []; }
}
function ecrire(items) {
  $panier.set(items);
  try { localStorage.setItem(CLE, JSON.stringify({ t: Date.now(), items })); } catch { /* navigation privée */ }
}

let pret = false;
export function initPanier() {
  if (pret) return;
  pret = true;
  $panier.set(lire());
  addEventListener('storage', (e) => { if (e.key === CLE) $panier.set(lire()); });
  addEventListener('pageshow', (e) => { if (e.persisted) $panier.set(lire()); });
}

export function ajouter(id, q) {
  initPanier();
  const items = $panier.get();
  const n = q ?? produit(id).defaut ?? 100;
  ecrire(items.some((i) => i.id === id) ? items.map((i) => (i.id === id ? { id, q: i.q + n } : i)) : [...items, { id, q: n }]);
  suivre('Ajout au devis');
  $ouvert.set(id);
}
export const changer = (id, q) => ecrire($panier.get().map((i) => (i.id === id ? { id, q } : i)));
export const retirer = (id) => ecrire($panier.get().filter((i) => i.id !== id));
export const vider = () => ecrire([]);

export function texteDevis() {
  const l = $lignes.get();
  if (!l.length) return '';
  return l.map((i) => `- ${i.nom} : ${quantite(i)}` + (i.prix ? ` × ${gnf(i.prix)} = ${gnf(i.prix * i.q)}` : ' (prix à discuter)')).join('\n')
    + `\nTotal estimé hors livraison : ${$total.get()}`;
}

export function envoyerWhatsApp(message) {
  suivre('Devis WhatsApp');
  window.open('https://wa.me/224620776222?text=' + encodeURIComponent(message), '_blank', 'noopener');
}
