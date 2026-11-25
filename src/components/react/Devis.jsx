import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $lignes, $ouvert, $total, changer, retirer, vider, initPanier, texteDevis, envoyerWhatsApp } from '../../lib/panier.js';
import { gnf } from '../../lib/produits.js';
import { chiffres, decimal } from '../../lib/saisie.js';

const ecrire = (q) => String(q).replace('.', ',');

function Ligne({ i, champ }) {
  const [texte, setTexte] = useState(ecrire(i.q));
  const vu = useRef(i.q);
  useEffect(() => { if (vu.current !== i.q) { vu.current = i.q; setTexte(ecrire(i.q)); } }, [i.q]);
  const idChamp = 'q-' + i.id.replace(/\W/g, '-');
  function saisir(e) {
    const t = i.m2 ? decimal(e.target.value) : chiffres(e.target.value);
    setTexte(t);
    const v = i.m2 ? parseFloat(t.replace(',', '.')) : parseInt(t, 10);
    if (v > 0 && Number.isFinite(v)) { vu.current = v; changer(i.id, v); }
  }
  return (
    <li>
      <div className="cart-info">
        <label htmlFor={idChamp}>{i.nom}</label>
        <span>{i.prix ? gnf(i.prix) + (i.m2 ? ' / m²' : ' l’unité') : 'Prix à discuter'}</span>
        <button className="cart-rm" type="button" aria-label={`Retirer ${i.nom}`} onClick={() => retirer(i.id)}>Retirer</button>
      </div>
      <input id={idChamp} ref={champ} type="text" inputMode={i.m2 ? 'decimal' : 'numeric'} autoComplete="off" maxLength={8} value={texte} onChange={saisir} onBlur={() => setTexte(ecrire(i.q))} />
      <span className="cart-sub">{i.prix ? gnf(i.prix * i.q) : ''}</span>
    </li>
  );
}

export default function Devis() {
  const lignes = useStore($lignes), ouvert = useStore($ouvert), total = useStore($total);
  const dlg = useRef(null), champs = useRef({});
  useEffect(() => { initPanier(); }, []);
  useEffect(() => {
    const d = dlg.current;
    if (ouvert === null) { if (d.open) d.close(); return; }
    if (!d.open) d.showModal();
    champs.current[ouvert]?.focus(); champs.current[ouvert]?.select();
  }, [ouvert]);
  const fermer = () => $ouvert.set(null);
  return (
    <>
      {lignes.length > 0 && <button key={lignes.length} className="cart-fab" type="button" onClick={() => $ouvert.set('')}>{`Mon devis (${lignes.length})`}</button>}
      <dialog className="cart" ref={dlg} aria-labelledby="cartTitle" onClose={fermer} onClick={(e) => { if (e.target === dlg.current) fermer(); }}>
        <div className="cart-head"><h2 id="cartTitle">Mon devis</h2><button className="cart-x" type="button" aria-label="Fermer" onClick={fermer}>×</button></div>
        <ul className="cart-list">{lignes.map((i) => <Ligne key={i.id} i={i} champ={(n) => { champs.current[i.id] = n; }} />)}</ul>
        <div className="cart-foot">
          <p className="cart-sum" aria-live="polite">{lignes.length ? `Total estimé : ${total}` : 'Votre devis est vide. Ajoutez des produits depuis la page Tarifs.'}</p>
          {lignes.length > 0 && <>
            <button className="btn cart-send" type="button" onClick={() => envoyerWhatsApp(`Bonjour POINT PRO GUINÉE, je souhaite un devis pour :\n${texteDevis()}`)}>Envoyer sur WhatsApp ↗</button>
            <p className="cart-note">Hors livraison. Vous pourrez relire le message avant l’envoi.</p>
            <button className="cart-clear" type="button" onClick={() => { vider(); fermer(); }}>Vider le devis</button>
          </>}
        </div>
      </dialog>
    </>
  );
}
