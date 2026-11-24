import { useRef, useState } from 'react';
import { GAMMES, PRODUITS, PAVE, gnf } from '../../lib/produits.js';
import { ajouter } from '../../lib/panier.js';

function Tableau({ gamme }) {
  return (
    <table className="price-table">
      <thead><tr><th>Produit</th><th>Description et usage</th><th>Dimensions</th><th>Prix (unité)</th></tr></thead>
      <tbody>
        {PRODUITS.filter((p) => p.gamme === gamme).map((p) => (
          <tr key={p.id} data-id={p.id}>
            <td className="prod">{p.nom}<span className="ref">{p.ref}</span></td>
            <td>{p.usage}</td>
            <td className="dim">{p.dim}</td>
            <td className="price">
              {p.prix ? gnf(p.prix) : 'À discuter'}
              <button className="add" type="button" aria-label={`Ajouter au devis : ${p.nom}`} onClick={() => ajouter(p.id)}>Ajouter au devis</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Paves() {
  const [modele, setModele] = useState(PAVE.modeles[0]);
  return (
    <div className="pave-card">
      <div className="pave">
        <h3>Pavés de voirie</h3>
        <p>Revêtements extérieurs haute résistance pour cours, allées et parkings. Épaisseur 60 mm.</p>
        <p className="big">{gnf(PAVE.prix)} / m²</p>
        <p>Tarif unique, tous modèles.</p>
        <div className="pave-add">
          <label htmlFor="paveModel">Modèle</label>
          <select id="paveModel" value={modele} onChange={(e) => setModele(e.target.value)}>{PAVE.modeles.map((m) => <option key={m}>{m}</option>)}</select>
          <button className="add" type="button" aria-label={`Ajouter au devis : pavés ${modele}`} onClick={() => ajouter(`pave:${modele}`)}>Ajouter au devis</button>
        </div>
      </div>
      <div className="pave">
        <h3>Modèles disponibles</h3>
        <p><b>P1, P6, P16</b> : format rectangulaire, classique et en H, idéal pour les zones de fort trafic et les parkings de stockage.</p>
        <p style={{ marginTop: 10 }}><b>P10</b> : format trèfle, design esthétique autobloquant.</p>
      </div>
    </div>
  );
}

export default function Tarifs() {
  const [actif, setActif] = useState('blocs');
  const refs = useRef({});
  function clavier(e, k) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const g = GAMMES[(k + (e.key === 'ArrowRight' ? 1 : GAMMES.length - 1)) % GAMMES.length];
    setActif(g.id); refs.current[g.id].focus();
  }
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Gammes de produits">
        {GAMMES.map((g, k) => (
          <button key={g.id} ref={(n) => { refs.current[g.id] = n; }} className="tab" role="tab" id={`t-${g.id}`} type="button"
            aria-selected={actif === g.id} aria-controls={`p-${g.id}`} tabIndex={actif === g.id ? 0 : -1}
            onClick={() => setActif(g.id)} onKeyDown={(e) => clavier(e, k)}>{g.titre}</button>
        ))}
      </div>
      {GAMMES.map((g) => (
        <div key={g.id} role="tabpanel" id={`p-${g.id}`} aria-labelledby={`t-${g.id}`} hidden={actif !== g.id} className={g.id === 'paves' ? 'panel' : 'panel table-box'}>
          {g.id === 'paves' ? <Paves /> : <Tableau gamme={g.id} />}
        </div>
      ))}
    </>
  );
}
