// Mesure d'audience avec Umami (sans cookie).
// Collez ici l'identifiant du site : umami.is > Settings > Websites > Edit > Website ID.
// Il est public. Tant qu'il est vide, rien n'est chargé ni envoyé.
export const UMAMI_ID = '';

const attente = [];
let pret = false, arret = !UMAMI_ID;

export function suivre(nom) {
  if (arret) return;
  if (pret) window.umami?.track(nom);
  else attente.push(nom); // Umami n'est pas encore chargé
}

export function demarrerAudience() {
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) arret = true;
  if (arret) return;
  const s = document.createElement('script');
  s.defer = true;
  s.src = 'https://cloud.umami.is/script.js';
  s.dataset.websiteId = UMAMI_ID;
  s.onload = () => { pret = true; attente.splice(0).forEach(suivre); };
  s.onerror = () => { arret = true; attente.length = 0; }; // bloqueur de publicité
  document.head.append(s);
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a');
    if (a?.href.startsWith('https://wa.me')) suivre('Clic WhatsApp');
    else if (a?.href.startsWith('tel:')) suivre('Appel');
  });
}
