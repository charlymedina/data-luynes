/**
 * Registre des thèmes du site : il alimente le menu (SiteHeader) et les crédits de l'accueil.
 * Pour ajouter un thème, suivre la liste de contrôle « Ajouter un thème » du README.
 */
import type { IconName } from '../lib/icons';

export interface Theme {
  slug: string;
  titre: string;
  /** Libellé court pour la barre de navigation */
  court: string;
  icon: IconName;
  resume: string;
}

export const THEMES: readonly Theme[] = [
  { slug: 'population', titre: 'Population', court: 'Population', icon: 'personnes', resume: 'Habitants depuis 1876, âges, naissances.' },
  { slug: 'territoire', titre: 'Territoire', court: 'Territoire', icon: 'carte', resume: 'Superficie, densité, classement dans le département.' },
  { slug: 'patrimoine-risques', titre: 'Patrimoine & risques', court: 'Patrimoine', icon: 'aqueduc', resume: 'Monuments, cavités, inondations, catastrophes naturelles.' },
  { slug: 'immobilier', titre: 'Immobilier', court: 'Immobilier', icon: 'maison', resume: 'Prix au m², ventes, loyers, étiquettes énergie.' },
  { slug: 'budget', titre: 'Budget & vie municipale', court: 'Budget', icon: 'mairie', resume: 'Recettes, dépenses, dette, impôts, subventions, indemnités des élus, marchés publics, conseil municipal.' },
  { slug: 'revenus-emploi', titre: 'Revenus & emploi', court: 'Revenus', icon: 'mallette', resume: 'Revenus, salaires, emplois, entreprises.' },
  { slug: 'accidents', titre: 'Accidents de la route', court: 'Accidents', icon: 'voiture', resume: 'Carte des accidents depuis 2005.' },
  { slug: 'equipements', titre: 'Écoles, santé & services', court: 'Services', icon: 'ecole', resume: 'Écoles, santé, commerces, services.' },
  { slug: 'energie-mobilite', titre: 'Énergie & mobilité', court: 'Énergie', icon: 'eclair', resume: 'Électricité, gaz, solaire, voitures électriques, bornes.' },
  { slug: 'elections', titre: 'Élections', court: 'Élections', icon: 'urne', resume: 'Participation depuis 1999, résultats des derniers scrutins.' },
  { slug: 'delinquance', titre: 'Délinquance', court: 'Délinquance', icon: 'bouclier', resume: 'Faits enregistrés, comparés au département et à la France.' },
  { slug: 'eau', titre: 'Eau du robinet', court: 'Eau', icon: 'goutte', resume: 'Contrôles sanitaires, nitrates, calcaire.' },
  { slug: 'construction', titre: 'Construction & logement social', court: 'Construction', icon: 'grue', resume: 'Logements autorisés et construits, logements sociaux.' },
  { slug: 'sport', titre: 'Sport', court: 'Sport', icon: 'ballon', resume: 'Licences par fédération, équipements, carte.' },
  { slug: 'nature', titre: 'Nature & paysages', court: 'Nature', icon: 'feuille', resume: 'Zones protégées, cultures, vignobles, espèces observées.' },
  { slug: 'rues', titre: 'Les rues de Luynes', court: 'Rues & lieux-dits', icon: 'panneau', resume: 'Noms de voies et de lieux-dits, personnes honorées, villes jumelles.' },
];
