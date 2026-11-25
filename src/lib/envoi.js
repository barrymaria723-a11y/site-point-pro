// Enregistre la demande sans jamais bloquer WhatsApp : à appeler juste avant d'ouvrir WhatsApp
import { $panier } from './panier.js';

// Un second clic sur « Envoyer » avec le même contenu garde le même identifiant : pas de doublon dans l'admin
let dernier = { contenu: '', id: undefined };

export async function enregistrer(demande) {
  const corps = { lignes: $panier.get(), ...demande }, contenu = JSON.stringify(corps);
  if (contenu !== dernier.contenu) dernier = { contenu, id: globalThis.crypto?.randomUUID?.() };
  try {
    const r = await fetch('/api/devis', {
      method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: dernier.id, ...corps }),
    });
    return r.ok;
  } catch { return false; }
}
