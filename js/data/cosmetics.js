// Objets de personnalisation (cadeaux mystère, récompenses) : teintures d'armure, capes, tuniques, titres, blasons.
export const RARITY = {
  commun: { name: 'Commun', color: '#cfc8b8', w: 58 }, rare: { name: 'Rare', color: '#5aa0f0', w: 28 },
  epique: { name: 'Épique', color: '#b070f0', w: 11 }, legendaire: { name: 'Légendaire', color: '#ffb030', w: 3 }
};
export const SLOTS = { tint: 'Teinture d’armure', cloak: 'Cape', tunic: 'Tunique', title: 'Titre', sigil: 'Blason' };
const C = (slot, name, rarity, value = null) => ({ slot, name, rarity, value });
export const COSMETICS = {
  tint_acier: C('tint', 'Acier poli', 'commun', '#9aa0a8'), tint_noir: C('tint', 'Noir de Châteaunoir', 'commun', '#2a2a2e'),
  tint_bronze: C('tint', 'Bronze de Braavos', 'rare', '#8a6a3a'), tint_rouge: C('tint', 'Laque écarlate', 'rare', '#7a1a14'),
  tint_or: C('tint', 'Or du Roc', 'epique', '#c9a227'), tint_givre: C('tint', 'Givre du Nord', 'epique', '#a8c8d8'), tint_valyrien: C('tint', 'Fumée valyrienne', 'legendaire', '#4a4a5a'),
  cape_grise: C('cloak', 'Cape grise du Nord', 'commun', '#6a6f76'), cape_brune: C('cloak', 'Cape de voyageur', 'commun', '#5a4030'),
  cape_ecarlate: C('cloak', 'Cape écarlate', 'rare', '#8b0000'), cape_verte: C('cloak', 'Cape des jardins', 'rare', '#3f6a34'),
  cape_doree: C('cloak', 'Manteau d’or', 'epique', '#c9a227'), cape_fourrure: C('cloak', 'Fourrure blanche', 'epique', '#e8ecef'), cape_nuit: C('cloak', 'Cape de la Garde de Nuit', 'rare', '#141416'),
  cape_dragon: C('cloak', 'Cape aux écailles de dragon', 'legendaire', '#3a0a0a'),
  tunique_ocre: C('tunic', 'Tunique ocre', 'commun', '#8a6a3a'), tunique_bleue: C('tunic', 'Tunique bleu nuit', 'commun', '#2a3a5a'),
  tunique_soie: C('tunic', 'Soie de Myr', 'rare', '#6a2a5a'), tunique_soleil: C('tunic', 'Lin de Dorne', 'rare', '#c8702a'),
  titre_hardi: C('title', 'le Hardi', 'commun'), titre_voyageur: C('title', 'le Voyageur', 'commun'), titre_main: C('title', 'Main de fer', 'rare'),
  titre_loup: C('title', 'Ami des loups', 'rare'), titre_inflexible: C('title', 'l’Inflexible', 'epique'), titre_ruelles: C('title', 'Prince des ruelles', 'epique'),
  titre_sanspeur: C('title', 'Sans-Peur', 'legendaire'), titre_personne: C('title', 'Personne', 'legendaire'),
  blason_loup: C('sigil', 'Loup hurlant', 'commun', '🐺'), blason_corbeau: C('sigil', 'Corbeau', 'commun', '🐦'), blason_epee: C('sigil', 'Épées croisées', 'rare', '⚔'),
  blason_soleil: C('sigil', 'Soleil levant', 'rare', '☀'), blason_tour: C('sigil', 'Tour fortifiée', 'epique', '♜'), blason_dragon: C('sigil', 'Dragon', 'legendaire', '🐉')
};
