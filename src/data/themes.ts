/**
 * Registre des thèmes du site. Pour ouvrir un nouveau thème :
 *  1. créer ses sources (data/sources.ts), ses requêtes (data/sql/<theme>_*.sql) et sa page (src/pages/<slug>.astro) ;
 *  2. passer son statut à « disponible » ici : il devient cliquable sur l'accueil et apparaît dans le menu.
 */
import type { IconName } from '../lib/icons';

export type StatutTheme = 'disponible' | 'bientot';

export interface Theme {
  slug: string;
  titre: string;
  /** Libellé court pour la barre de navigation */
  court: string;
  icon: IconName;
  resume: string;
  statut: StatutTheme;
}

export const THEMES: readonly Theme[] = [
  { slug: 'population', titre: 'Population', court: 'Population', icon: 'personnes', resume: 'Habitants depuis 1876, âges, naissances.', statut: 'disponible' },
  { slug: 'territoire', titre: 'Territoire', court: 'Territoire', icon: 'carte', resume: 'Superficie, densité, classement dans le département.', statut: 'disponible' },
  { slug: 'patrimoine-risques', titre: 'Patrimoine & risques', court: 'Patrimoine', icon: 'aqueduc', resume: 'Monuments, cavités, inondations, catastrophes naturelles.', statut: 'disponible' },
  { slug: 'immobilier', titre: 'Immobilier', court: 'Immobilier', icon: 'maison', resume: 'Prix au m², ventes, loyers, étiquettes énergie.', statut: 'disponible' },
  { slug: 'budget', titre: 'Budget communal', court: 'Budget', icon: 'pieces', resume: 'Recettes, dépenses, dette, impôts locaux.', statut: 'disponible' },
  { slug: 'revenus-emploi', titre: 'Revenus & emploi', court: 'Revenus', icon: 'mallette', resume: 'Revenus, salaires, emplois, entreprises.', statut: 'disponible' },
  { slug: 'accidents', titre: 'Accidents de la route', court: 'Accidents', icon: 'voiture', resume: 'Carte des accidents depuis 2005.', statut: 'disponible' },
  { slug: 'equipements', titre: 'Écoles, santé & services', court: 'Services', icon: 'ecole', resume: 'Écoles, santé, commerces, services.', statut: 'disponible' },
  { slug: 'energie-mobilite', titre: 'Énergie & mobilité', court: 'Énergie', icon: 'eclair', resume: 'Électricité, gaz, solaire, voitures électriques, bornes.', statut: 'disponible' },
  { slug: 'elections', titre: 'Élections', court: 'Élections', icon: 'urne', resume: 'Participation depuis 1999, résultats des derniers scrutins.', statut: 'disponible' },
  { slug: 'delinquance', titre: 'Délinquance', court: 'Délinquance', icon: 'bouclier', resume: 'Faits enregistrés, comparés au département et à la France.', statut: 'disponible' },
];

export const themesDisponibles: readonly Theme[] = THEMES.filter((theme) => theme.statut === 'disponible');
export const themesBientot: readonly Theme[] = THEMES.filter((theme) => theme.statut === 'bientot');
