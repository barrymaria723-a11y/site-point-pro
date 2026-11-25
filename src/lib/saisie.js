// Filtres de saisie : retirent tout ce qui n'a pas sa place dans un champ chiffré, même en collant du texte
export const chiffres = (v) => v.replace(/\D/g, '');

// Nombre positif avec une seule virgule (ou un seul point)
export function decimal(v) {
  const s = v.replace(/[^\d.,]/g, ''), i = s.search(/[.,]/);
  return i < 0 ? s : s.slice(0, i + 1) + s.slice(i + 1).replace(/[.,]/g, '');
}

// Téléphone : chiffres et espaces, avec un + possible au début
export function telephone(v) {
  const s = v.replace(/[^\d+\s]/g, '').replace(/\s+/g, ' ').trimStart();
  return (s.startsWith('+') ? '+' : '') + s.replace(/\+/g, '');
}
