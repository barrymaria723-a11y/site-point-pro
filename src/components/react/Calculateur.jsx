import { useState } from 'react';
import { PRODUITS, PAVE, FACE_M2, produit, gnf, nombre } from '../../lib/produits.js';
import { ajouter } from '../../lib/panier.js';
import { decimal } from '../../lib/saisie.js';

const MESURES = ['L', 'H', 'O'];
const MURS = PRODUITS.filter((p) => p.mur);

// '' → null, texte illisible → NaN ; accepte la virgule
function lire(v) {
  const s = v.trim().replace(/\s/g, '').replace(',', '.');
  return s === '' ? null : /^(\d+\.?\d*|\.\d+)$/.test(s) ? parseFloat(s) : NaN;
}

export function calculer({ mode, L, H, O, brique, modele, marge }) {
  const sol = mode === 'sol', l = lire(L), h = lire(H), o = sol ? 0 : lire(O) ?? 0;
  if (l === null || h === null) return { message: `Remplissez la longueur et la ${sol ? 'largeur' : 'hauteur'}.` };
  if (!(l > 0 && h > 0 && o >= 0)) return { message: 'Vérifiez vos mesures : des nombres positifs, par exemple 2,5.' };
  if (o >= l * h) return { message: 'Les ouvertures dépassent la surface du mur.' };
  const aire = l * h - o, k = 1 + marge / 100;
  if (sol) {
    const q = Math.ceil(aire * k * 100 - 1e-6) / 100;
    return { id: `pave:${modele}`, q, quantite: `${nombre(q)} m²`, prix: q * PAVE.prix, message: `Pour ${nombre(aire)} m² de sol.` };
  }
  const q = Math.ceil((aire / FACE_M2) * k - 1e-6);
  return { id: brique, q, quantite: `${nombre(q, 0)} briques`, prix: q * produit(brique).prix, message: `Pour ${nombre(aire)} m² de mur${o > 0 ? ', ouvertures déduites' : ''}.` };
}

// Mur qui se monte : 1 à 5 rangs selon la quantité
function Mur({ rangs, sol }) {
  return (
    <div className={`calc-wall${sol ? ' sol' : ''}`} aria-hidden="true">
      {Array.from({ length: rangs }, (_, k) => rangs - 1 - k).map((r) => {
        const impair = r % 2;
        return (
          <div key={r}>
            {Array.from({ length: impair ? 7 : 6 }, (_, k) => (
              <i key={k} className={impair && (k === 0 || k === 6) ? 'half' : ''} style={{ animationDelay: `${k * 45}ms` }} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function Calculateur() {
  const [f, setF] = useState({ mode: 'mur', L: '', H: '', O: '', brique: MURS[0].id, modele: PAVE.modeles[0], marge: 5 });
  const maj = (k) => (e) => setF({ ...f, [k]: k === 'marge' ? +e.target.value : MESURES.includes(k) ? decimal(e.target.value) : e.target.value });
  const sol = f.mode === 'sol', r = calculer(f);
  const rangs = r.q ? Math.max(1, Math.min(5, Math.ceil(r.q / (sol ? 15 : 120)))) : 0;
  return (
    <form className="calc" noValidate onSubmit={(e) => { e.preventDefault(); if (r.id) ajouter(r.id, r.q); }}>
      <div className="calc-fields">
        <fieldset className="who"><legend>Votre ouvrage</legend><div className="who-opts">
          {[['mur', 'Mur'], ['sol', 'Cour ou allée']].map(([v, t]) => (
            <label className="who-opt" key={v}><input type="radio" name="ouvrage" value={v} checked={f.mode === v} onChange={maj('mode')} /><span>{t}</span></label>
          ))}
        </div></fieldset>
        <div className="field"><label htmlFor="cL">LONGUEUR (M)</label><input id="cL" inputMode="decimal" maxLength={8} autoComplete="off" placeholder="10" value={f.L} onChange={maj('L')} /></div>
        <div className="field"><label htmlFor="cH">{sol ? 'LARGEUR (M)' : 'HAUTEUR (M)'}</label><input id="cH" inputMode="decimal" maxLength={8} autoComplete="off" placeholder="2,5" value={f.H} onChange={maj('H')} /></div>
        {sol ? (
          <div className="field"><label htmlFor="cP">MODÈLE DE PAVÉ</label><select id="cP" value={f.modele} onChange={maj('modele')}>{PAVE.modeles.map((m) => <option key={m}>{m}</option>)}</select></div>
        ) : (
          <>
            <div className="field"><label htmlFor="cO">PORTES ET FENÊTRES (M²)</label><input id="cO" inputMode="decimal" maxLength={8} autoComplete="off" placeholder="0" value={f.O} onChange={maj('O')} /></div>
            <div className="field"><label htmlFor="cB">BRIQUE</label><select id="cB" value={f.brique} onChange={maj('brique')}>{MURS.map((p) => <option key={p.id} value={p.id}>{`${p.nom} (${gnf(p.prix)})`}</option>)}</select></div>
          </>
        )}
        <div className="field"><label htmlFor="cM">MARGE POUR LA CASSE</label><select id="cM" value={f.marge} onChange={maj('marge')}><option value={0}>Aucune</option><option value={5}>5 %</option><option value={10}>10 %</option></select></div>
      </div>
      <div className="calc-result">
        <Mur rangs={rangs} sol={sol} />
        <div aria-live="polite">
          <span className="calc-label">À prévoir</span>
          <strong>{r.quantite ?? '—'}</strong>
          <p>{r.message}</p>
          <p className="calc-price">{r.id ? `Environ ${gnf(r.prix)}` : ''}</p>
        </div>
        <button className="btn" type="submit" disabled={!r.id}>Ajouter au devis</button>
      </div>
    </form>
  );
}
