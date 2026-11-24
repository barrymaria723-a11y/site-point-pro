import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { ADMIN_MOT_DE_PASSE, SESSION_SECRET } from 'astro:env/server';

const COOKIE = 'pp-admin', HEURES = 12;
export const secretPret = () => (SESSION_SECRET?.length ?? 0) >= 32;
export const adminPret = () => secretPret() && (ADMIN_MOT_DE_PASSE?.length ?? 0) >= 12;

const hmac = (t) => createHmac('sha256', SESSION_SECRET).update(t).digest('hex');
const egal = (a, b) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());

// L'adresse IP n'est jamais enregistrée en clair
export const empreinte = (prefixe, ip) => `${prefixe}:${hmac(`ip:${ip}`).slice(0, 32)}`;
export const bonMotDePasse = (m) => adminPret() && egal(String(m), ADMIN_MOT_DE_PASSE);

// Changer le mot de passe ferme toutes les sessions
const signer = (fin) => hmac(`session:${fin}:${hmac(`mdp:${ADMIN_MOT_DE_PASSE}`)}`);
export function ouvrirSession(cookies) {
  const fin = Date.now() + HEURES * 36e5;
  cookies.set(COOKIE, `${fin}.${signer(fin)}`, { httpOnly: true, secure: import.meta.env.PROD, sameSite: 'strict', path: '/admin', maxAge: HEURES * 3600 });
}
export const fermerSession = (cookies) => cookies.delete(COOKIE, { path: '/admin' });
export function connecte(cookies) {
  if (!adminPret()) return false;
  const [fin, sig] = (cookies.get(COOKIE)?.value ?? '').split('.');
  return Boolean(fin && sig) && Number(fin) > Date.now() && egal(sig, signer(fin));
}
