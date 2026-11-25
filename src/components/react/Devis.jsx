import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $lignes, $ouvert, $total, changer, retirer, vider, initPanier, texteDevis, envoyerWhatsApp } from '../../lib/panier.js';
import { gnf } from '../../lib/produits.js';
import { enregistrer } from '../../lib/envoi.js';
import { telephoneValide } from '../../lib/choix.js';
import { chiffres, decimal, telephone as filtrerTel } from '../../lib/saisie.js';

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
  const [c, setC] = useState({ nom: '', telephone: '', site: '' });
  const [etat, setEtat] = useState('');
  const tel = useRef(null);
  const maj = (k) => (e) => { tel.current?.setCustomValidity(''); setC({ ...c, [k]: k === 'telephone' ? filtrerTel(e.target.value) : e.target.value }); };
  function envoyer(e) {
    e.preventDefault();
    const telephone = c.telephone.trim(), nom = c.nom.trim();
    tel.current.setCustomValidity(telephoneValide(telephone) ? '' : 'Entrez un numéro de téléphone valide, par exemple 620 00 00 00.');
    if (!tel.current.reportValidity()) return;
    setEtat('');
    enregistrer({ nom, telephone, site: c.site }).then((ok) => setEtat(ok ? 'Votre demande est enregistrée. Envoyez aussi le message WhatsApp pour une réponse plus rapide.' : 'Envoyez bien le message WhatsApp : c’est lui qui nous transmet votre demande.'));
    envoyerWhatsApp(`Bonjour POINT PRO GUINÉE, je souhaite un devis.\nNom : ${nom}\nTéléphone : ${telephone}\n\nProduits :\n${texteDevis()}`);
  }
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
            <form className="cart-form" onSubmit={envoyer}>
              <div className="field"><label htmlFor="cartNom">NOM *</label><input id="cartNom" required maxLength={120} autoComplete="name" value={c.nom} onChange={maj('nom')} /></div>
              <div className="field"><label htmlFor="cartTel">TÉLÉPHONE *</label><input id="cartTel" ref={tel} type="tel" inputMode="tel" required maxLength={25} autoComplete="tel" value={c.telephone} onChange={maj('telephone')} /></div>
              <input className="piege" name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" value={c.site} onChange={maj('site')} />
              <button className="btn cart-send" type="submit">Envoyer sur WhatsApp ↗</button>
            </form>
            {etat && <p className="etat" role="status">{etat}</p>}
            <p className="cart-note">Hors livraison. Vos coordonnées sont enregistrées pour traiter votre demande. Vous relirez le message avant l’envoi.</p>
            <button className="cart-clear" type="button" onClick={() => { vider(); fermer(); }}>Vider le devis</button>
          </>}
        </div>
      </dialog>
    </>
  );
}
