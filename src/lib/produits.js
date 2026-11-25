// Source unique des prix : tableau, calculateur, devis et message WhatsApp lisent ce fichier.
// prix: 0 = « À discuter ». mur: true = proposé dans le calculateur de mur.
export const GAMMES = [
  { id: 'blocs', titre: 'Blocs et briques' },
  { id: 'hourdis', titre: 'Hourdis et bordures' },
  { id: 'paves', titre: 'Pavés' },
];

export const PRODUITS = [
  { id: 'b15c', gamme: 'blocs', nom: 'Brique 15 creux standard', ref: 'Réf. H2 / M6', usage: 'Bloc creux standard pour murs extérieurs et clôtures.', dim: '400 × 150 × 200 mm', prix: 7000, mur: true },
  { id: 'b20c', gamme: 'blocs', nom: 'Brique 20 creux', ref: 'Réf. H1 / H5', usage: 'Bloc creux pour les structures et les murs porteurs.', dim: '400 × 200 × 200 mm', prix: 10000, mur: true },
  { id: 'b12c', gamme: 'blocs', nom: 'Brique 12 creux', ref: 'Réf. M3', usage: 'Bloc creux pour cloisons et séparations intérieures.', dim: '400 × 125 × 200 mm', prix: 6000, mur: true },
  { id: 'b10c', gamme: 'blocs', nom: 'Brique 10 creux', ref: 'Réf. H4 / H7', usage: 'Bloc creux fin pour gaines techniques et séparations légères.', dim: '400 × 100 × 200 mm', prix: 5500, mur: true },
  { id: 'b20p', gamme: 'blocs', nom: 'Brique 20 pleine', ref: 'Réf. H19', usage: 'Bloc plein à haute résistance mécanique pour soubassements et fondations.', dim: '400 × 150 × 200 mm', prix: 15000, mur: true },
  { id: 'b15p', gamme: 'blocs', nom: 'Brique 15 pleine', ref: 'Réf. H18', usage: 'Bloc plein à compacité renforcée.', dim: '400 × 150 × 200 mm', prix: 13000, mur: true },
  { id: 'b15l', gamme: 'blocs', nom: 'Brique 15 creux libanais', ref: 'Réf. H15', usage: 'Bloc perforé alvéolaire à haute performance d’isolation thermique.', dim: '400 × 150 × 200 mm', prix: 7500, mur: true },
  { id: 'hsn', gamme: 'hourdis', nom: 'Hourdis sénégalais', ref: 'Réf. H9', usage: 'Élément de coffrage pour dalles et planchers intermédiaires.', dim: '500 × 150 × 200 mm', prix: 8500 },
  { id: 'hfr', gamme: 'hourdis', nom: 'Hourdis français', ref: 'Réf. H10', usage: 'Entrevous technique avec système d’emboîtement.', dim: '400 × 150 × 200 mm', prix: 9000 },
  { id: 'bord', gamme: 'hourdis', nom: 'Bordure de route grand format', ref: 'Modèle C6', usage: 'Bordure de voirie en béton compacté haute résistance, pour séparer et délimiter les voies lourdes.', dim: '800 × 150 × 300 mm', prix: 0, defaut: 10 },
];

export const PAVE = { prix: 90000, modeles: ['P1', 'P6', 'P16', 'P10'] };

// Face d'une brique avec un joint de 1 cm : 41 × 21 cm
export const FACE_M2 = 0.41 * 0.21;

// « pave:P1 » ou l'identifiant d'un produit du tableau
export function produit(id) {
  if (id.startsWith('pave:')) {
    const modele = id.slice(5);
    return PAVE.modeles.includes(modele) ? { id, nom: `Pavés ${modele}`, prix: PAVE.prix, m2: true, defaut: 10 } : null;
  }
  return PRODUITS.find((p) => p.id === id) || null;
}

const espaces = (s) => s.replace(/[  ]/g, ' ');
export const nombre = (n, dec = 2) => espaces(n.toLocaleString('fr-FR', { maximumFractionDigits: dec }));
export const gnf = (n) => `${nombre(n, 0)} GNF`;
