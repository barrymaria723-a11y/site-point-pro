import { createHash, createHmac, randomBytes, scrypt as scryptRappel, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { ADMIN_MOT_DE_PASSE, SESSION_SECRET } from 'astro:env/server';
import { sql } from './base.js';

const scrypt = promisify(scryptRappel);
const COOKIE = 'pp-admin', HEURES = 12;
export const MDP_MIN = 12, MDP_MAX = 200;
export const secretPret = () => (SESSION_SECRET?.length ?? 0) >= 32;
export const adminPret = () => secretPret() && (ADMIN_MOT_DE_PASSE?.length ?? 0) >= MDP_MIN;

const hmac = (t) => createHmac('sha256', SESSION_SECRET).update(t).digest('hex');
const egal = (a, b) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());

// L'adresse IP n'est jamais enregistrée en clair
export const empreinte = (prefixe, ip) => `${prefixe}:${hmac(`ip:${ip}`).slice(0, 32)}`;

// ----- Mot de passe -----
// Au départ : ADMIN_MOT_DE_PASSE dans Vercel. Une fois changé depuis le site, une empreinte scrypt en base le remplace.
// En cas d'oubli : changer ADMIN_MOT_DE_PASSE dans Vercel et republier, l'empreinte en base est alors ignorée.
const initial = () => hmac(`mdp:${ADMIN_MOT_DE_PASSE}`);
async function enregistre() {
  const [l] = await sql("select valeur from reglages where cle = 'mot-de-passe'");
  return l && l.valeur.initial === initial() ? l.valeur : null;
}
const deriver = async (mdp, sel) => (await scrypt(mdp.normalize('NFC'), sel, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })).toString('hex');

export async function bonMotDePasse(saisi) {
  const mdp = String(saisi);
  if (!adminPret() || mdp.length > MDP_MAX) return false;
  const e = await enregistre();
  return e ? egal(await deriver(mdp, e.sel), e.hash) : egal(mdp, ADMIN_MOT_DE_PASSE);
}
export async function changerMotDePasse(mdp) {
  const sel = randomBytes(16).toString('hex');
  const valeur = JSON.stringify({ sel, hash: await deriver(mdp, sel), initial: initial() });
  await sql("insert into reglages (cle, valeur) values ('mot-de-passe', $1::jsonb) on conflict (cle) do update set valeur = excluded.valeur", [valeur]);
}

// ----- Session : changer le mot de passe ferme toutes les autres -----
const signer = async (fin) => hmac(`session:${fin}:${(await enregistre())?.hash ?? initial()}`);
export async function ouvrirSession(cookies) {
  const fin = Date.now() + HEURES * 36e5;
  cookies.set(COOKIE, `${fin}.${await signer(fin)}`, { httpOnly: true, secure: import.meta.env.PROD, sameSite: 'strict', path: '/admin', maxAge: HEURES * 3600 });
}
export const fermerSession = (cookies) => cookies.delete(COOKIE, { path: '/admin' });
export async function connecte(cookies) {
  if (!adminPret()) return false;
  const [fin, sig] = (cookies.get(COOKIE)?.value ?? '').split('.');
  return Boolean(fin && sig) && Number(fin) > Date.now() && egal(sig, await signer(fin));
}
