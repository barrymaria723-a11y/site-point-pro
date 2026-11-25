import { produit } from '../lib/produits.js';
import { SERVICES, VILLES, telephoneValide } from '../lib/choix.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const texte = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max) : '');

// Nettoie une demande reçue. Les prix sont toujours recalculés ici : ceux du navigateur sont ignorés.
export function valider(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return { erreur: 'Demande illisible.' };
  const r = {
    id: UUID.test(d.id) ? d.id : crypto.randomUUID(),
    type: d.type === 'Entreprise' ? 'Entreprise' : 'Particulier',
    nom: texte(d.nom, 120), entreprise: texte(d.entreprise, 120), telephone: texte(d.telephone, 30),
    service: SERVICES.includes(d.service) ? d.service : '', ville: VILLES.includes(d.ville) ? d.ville : '', besoin: texte(d.besoin, 2000),
    lignes: [], total: 0, a_chiffrer: false,
  };
  if (!r.nom) return { erreur: 'Le nom est obligatoire.' };
  if (!telephoneValide(r.telephone)) return { erreur: 'Le numéro de téléphone n’est pas valide.' };
  for (const l of Array.isArray(d.lignes) ? d.lignes.slice(0, 30) : []) {
    const p = typeof l?.id === 'string' ? produit(l.id) : null;
    const q = p?.m2 ? Math.round(l.q * 100) / 100 : Math.floor(l?.q);
    if (!p || typeof l.q !== 'number' || !(q > 0) || q > 1e7 || r.lignes.some((x) => x.id === p.id)) continue;
    r.lignes.push({ id: p.id, nom: p.nom, q, prix: p.prix, m2: Boolean(p.m2) });
    r.total += Math.round(p.prix * q);
    if (!p.prix) r.a_chiffrer = true;
  }
  return { devis: r };
}
