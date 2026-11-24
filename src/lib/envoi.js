// Enregistre la demande sans jamais bloquer WhatsApp : à appeler juste avant d'ouvrir WhatsApp
import { $panier } from './panier.js';

export async function enregistrer(demande) {
  try {
    const r = await fetch('/api/devis', {
      method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: globalThis.crypto?.randomUUID?.(), lignes: $panier.get(), ...demande }),
    });
    return r.ok;
  } catch { return false; }
}
