// Effets visuels. Règle : le contenu est visible sans eux, et une minuterie termine chaque animation.
import { demarrerAudience } from '../lib/audience.js';
demarrerAudience();

const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
const souris = matchMedia('(hover: hover) and (pointer: fine)').matches;
const tous = (s, r = document) => [...r.querySelectorAll(s)];
const creer = (tag, classe) => { const e = document.createElement(tag); e.className = classe; return e; };

setTimeout(() => { const i = document.querySelector('.intro'); if (i) i.style.display = 'none'; }, 1800);
setTimeout(() => document.querySelector('h1')?.classList.add('words-done'), 2400);

// ----- Apparition au défilement -----
const GROUPES = '.services, .equipment-grid, .brick-gallery, .gallery, .stats, .fleet, .cat-docs, .brick-points, .footer-grid, .ticks';
if (!calme) {
  const attente = new Set(tous('.reveal')), cascade = new Set();
  for (const g of tous(GROUPES)) {
    g.closest('.reveal') && attente.delete(g);
    [...g.children].forEach((c, i) => { attente.delete(c); c.style.setProperty('--d', `${i * 90}ms`); attente.add(c); cascade.add(c); });
  }
  const jouer = (el) => {
    attente.delete(el); el.dataset.anim = cascade.has(el) ? 'pop' : 'in'; // attribut et non classe : React et Vue gardent la main sur leurs classes
    setTimeout(() => { delete el.dataset.anim; el.style.removeProperty('--d'); }, 2000);
  };
  const verifier = () => { for (const el of attente) { const r = el.getBoundingClientRect(); if (r.width && r.top < innerHeight - 10 && r.bottom > 0) jouer(el); } };
  verifier();
  addEventListener('scroll', verifier, { passive: true });
  addEventListener('resize', verifier);
  const veille = setInterval(() => { verifier(); if (!attente.size) clearInterval(veille); }, 400);
}

// ----- Barre de progression, retour en haut, parallaxe -----
const barre = creer('div', 'progress'); barre.setAttribute('aria-hidden', 'true');
const haut = creer('button', 'to-top'); haut.type = 'button'; haut.setAttribute('aria-label', 'Revenir en haut de la page');
haut.innerHTML = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>';
haut.addEventListener('click', () => scrollTo({ top: 0, behavior: calme ? 'auto' : 'smooth' }));
document.body.append(barre, haut);
const tetes = calme ? [] : tous('.page-hero-inner, .hero-inner');
let prevu = false;
function defile() {
  prevu = false;
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  barre.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;
  haut.classList.toggle('show', y > 600);
  if (y < 900) for (const t of tetes) { t.style.transform = `translateY(${(y * 0.25).toFixed(1)}px)`; t.style.opacity = Math.max(0, 1 - y / 700).toFixed(2); }
}
addEventListener('scroll', () => { if (!prevu) { prevu = true; requestAnimationFrame(defile); } }, { passive: true });
defile();

// ----- Halo, cartes en relief, boutons aimantés -----
for (const hero of tous('.page-hero, .hero')) {
  const g = creer('div', 'glow'); g.setAttribute('aria-hidden', 'true');
  hero.insertBefore(g, hero.querySelector('.page-hero-inner, .hero-inner'));
  if (souris && !calme) hero.addEventListener('mousemove', (e) => { const r = hero.getBoundingClientRect(); g.style.left = `${e.clientX - r.left}px`; g.style.top = `${e.clientY - r.top}px`; });
}
if (souris && !calme) {
  for (const c of tous('.service, .equip')) {
    c.classList.add('tilt');
    c.addEventListener('mousemove', (e) => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-6px)`; });
    c.addEventListener('mouseleave', () => { c.style.transform = ''; });
  }
  for (const b of tous('main a.btn')) {
    b.addEventListener('mousemove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px)`; });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  }
}
if (!calme) document.addEventListener('click', (e) => {
  const b = e.target.closest?.('a.btn, .wa');
  if (!b) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), o = creer('span', 'ripple');
  o.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
  b.append(o); setTimeout(() => o.remove(), 650);
});

// ----- Poussière de chantier (accueil) -----
const hero = document.querySelector('.hero');
if (hero && !calme) {
  const c = creer('canvas', 'dust'); c.setAttribute('aria-hidden', 'true');
  hero.insertBefore(c, hero.querySelector('.hero-inner'));
  const ctx = c.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
  let W, H, actif = false;
  const taille = () => { W = hero.clientWidth; H = hero.clientHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  taille(); addEventListener('resize', taille);
  const grains = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 2.6, s: 0.15 + Math.random() * 0.45, a: 0.25 + Math.random() * 0.5, o: Math.random() < 0.35 }));
  function dessiner() {
    if (!actif) return;
    ctx.clearRect(0, 0, W, H);
    for (const p of grains) {
      p.y -= (p.s / H) * 1.4; p.x += Math.sin((p.y + p.r) * 12) * 0.0004;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 6.283);
      ctx.fillStyle = p.o ? `rgba(232,137,43,${p.a})` : `rgba(255,255,255,${p.a * 0.6})`; ctx.fill();
    }
    requestAnimationFrame(dessiner);
  }
  new IntersectionObserver(([e]) => { const avant = actif; actif = e.isIntersecting; if (actif && !avant) requestAnimationFrame(dessiner); }).observe(hero);
}

// ----- Photos hors écran : chargées après le reste, sauf en mode économie de données -----
addEventListener('load', () => setTimeout(() => { if (!navigator.connection?.saveData) tous('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; }); }, 800));

// ----- Arrivée sur une adresse du type /#tarifs : aller droit à la bonne partie, sans défilement animé -----
if (location.hash.length > 1) {
  const cible = document.getElementById(location.hash.slice(1));
  if (cible) { cible.scrollIntoView({ behavior: 'instant' }); addEventListener('load', () => cible.scrollIntoView({ behavior: 'instant' }), { once: true }); }
}
