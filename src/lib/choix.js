// Listes du formulaire
export const SERVICES = ['Briqueterie / parpaings', 'Hourdis', 'Pavés / bordures', 'Matériaux de construction', 'Transport', 'Location d’engins', 'Plusieurs services'];
export const VILLES = ['Conakry', 'Koliagbé', 'Mamou', 'Kindia', 'Autre'];
export const telephoneValide = (t) => /^\+?[\d\s().-]{6,25}$/.test(t) && /^\d{6,15}$/.test(t.replace(/\D/g, ''));
