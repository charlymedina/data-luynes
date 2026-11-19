/**
 * Registre des thèmes du site. Pour ouvrir un nouveau thème :
 *  1. créer ses sources (data/sources.ts), ses requêtes (data/sql/<theme>_*.sql) et sa page (src/pages/<slug>.astro) ;
 *  2. passer son statut à « disponible » ici : il devient cliquable sur l'accueil.
 */
export type StatutTheme = 'disponible' | 'bientot';

export interface Theme {
  slug: string;
  titre: string;
  emoji: string;
  resume: string;
  statut: StatutTheme;
}

export const THEMES: readonly Theme[] = [
  { slug: 'population', titre: 'Population', emoji: '👥', resume: 'Habitants depuis 1876, âges, naissances.', statut: 'disponible' },
  { slug: 'territoire', titre: 'Territoire', emoji: '🗺️', resume: 'Superficie, densité, classement dans le département.', statut: 'disponible' },
  { slug: 'patrimoine-risques', titre: 'Patrimoine & risques', emoji: '🏰', resume: 'Monuments, cavités, inondations, catastrophes naturelles.', statut: 'disponible' },
  { slug: 'immobilier', titre: 'Immobilier', emoji: '🏠', resume: 'Prix au m², ventes, loyers, étiquettes énergie.', statut: 'disponible' },
  { slug: 'budget', titre: 'Budget communal', emoji: '💶', resume: 'Recettes, dépenses, dette, impôts locaux.', statut: 'disponible' },
  { slug: 'revenus-emploi', titre: 'Revenus & emploi', emoji: '💼', resume: 'Revenus, salaires, emplois, entreprises.', statut: 'disponible' },
  { slug: 'accidents', titre: 'Accidents de la route', emoji: '🚗', resume: 'Carte des accidents depuis 2005.', statut: 'bientot' },
  { slug: 'climat', titre: 'Climat', emoji: '🌦️', resume: 'Températures, pluie et records autour de Tours.', statut: 'bientot' },
  { slug: 'equipements', titre: 'Écoles & services', emoji: '🏫', resume: 'Écoles, santé, commerces, services.', statut: 'bientot' },
  { slug: 'energie-mobilite', titre: 'Énergie & mobilité', emoji: '⚡', resume: 'Électricité, solaire, voitures, bus.', statut: 'bientot' },
];

export const themesBientot: readonly Theme[] = THEMES.filter((theme) => theme.statut === 'bientot');
