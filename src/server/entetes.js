// Pages privées : jamais en cache, ni indexées, ni affichées dans un cadre
export function proteger(reponse) {
  reponse.headers.set('Cache-Control', 'no-store');
  reponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
  reponse.headers.set('X-Frame-Options', 'DENY');
  reponse.headers.set('Referrer-Policy', 'same-origin');
}
