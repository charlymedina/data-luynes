/**
 * Données « vie municipale » de la page Budget, générées par `npm run data` (voir data/sql/_budget.sql et budget_*.sql) :
 * indemnités des élus, subventions, marchés publics, appels d'offres, conseil municipal.
 * Sources : balances comptables (DGFiP), marchés publics (DECP), appels d'offres (BOAMP), répertoire national des élus.
 * Aucun nom d'élu, sauf celui du maire (information publique du répertoire).
 * Les dépenses par nature et les comparaisons de dépenses de fonctionnement sont dans budget.ts (comptes individuels).
 */
import elusRows from './generated/budget_elus.json';
import subventionsRows from './generated/budget_subventions.json';
import comparaisonRows from './generated/budget_comparaison.json';
import marchesRows from './generated/budget_marches.json';
import appelsOffresRows from './generated/budget_appels_offres.json';
import conseilResumeRows from './generated/budget_conseil_resume.json';
import conseilAgesRows from './generated/budget_conseil_ages.json';
import conseilCspRows from './generated/budget_conseil_csp.json';
import maireRows from './generated/budget_maire.json';
import { firstRow } from './rows';

export interface AnneeElus {
  annee: number;
  indemnites: number;
  frais_cotisations: number;
  total: number;
  indemnites_par_habitant: number;
  total_par_habitant: number;
  population: number;
}

export interface AnneeSubventions {
  annee: number;
  associations: number;
  ccas: number;
  associations_par_habitant: number;
  ccas_par_habitant: number;
  population: number;
}

export type IndicateurComparaison = 'indemnites' | 'associations' | 'ccas';

export interface Comparaison {
  indicateur: IndicateurComparaison;
  annee: number;
  strate: string;
  luynes_par_habitant: number;
  strate_par_habitant: number;
  nb_communes_strate: number;
  mediane_37: number;
  rang: number;
  nb_communes: number;
}

export interface Marche {
  id: string;
  objet: string;
  titulaire: string | null;
  ville_titulaire: string | null;
  procedure: string | null;
  date_notification: string;
  date_publication: string | null;
  /** Montant maximum du contrat (plafond), JAMAIS une dépense : ne pas additionner. */
  plafond: number | null;
  /** Valeur technique de plafond (999 999 €, 909 090 €…) : sans lien avec la dépense réelle. */
  plafond_technique: boolean | null;
  duree_mois: number | null;
}

export interface AppelOffres {
  idweb: string;
  date_parution: string;
  annee: number;
  objet: string;
  famille: string;
}

export interface ConseilResume {
  nb_elus: number;
  femmes: number;
  hommes: number;
  part_femmes: number;
  age_moyen: number;
  nb_executif: number;
  femmes_executif: number;
  debut_mandat: string;
  part_femmes_population: number;
  age_moyen_population: number;
  annee_recensement: number;
}

export interface TrancheAge {
  ordre: number;
  libelle: string;
  elus: number;
  part_elus: number;
  part_habitants: number;
}

export interface CategorieProfession {
  categorie: string;
  groupe_csp: number;
  elus: number;
  part: number;
}

export interface Maire {
  prenom: string;
  nom: string;
  debut_mandat: string;
}

export const anneesElus: readonly AnneeElus[] = elusRows as AnneeElus[];
export const anneesSubventions: readonly AnneeSubventions[] = subventionsRows as AnneeSubventions[];
export const comparaisons: readonly Comparaison[] = comparaisonRows as Comparaison[];
export const marches: readonly Marche[] = marchesRows as Marche[];
export const appelsOffres: readonly AppelOffres[] = appelsOffresRows as AppelOffres[];
export const conseil: ConseilResume = firstRow(conseilResumeRows as ConseilResume[], 'budget_conseil_resume');
export const tranchesAge: readonly TrancheAge[] = conseilAgesRows as TrancheAge[];
export const professions: readonly CategorieProfession[] = conseilCspRows as CategorieProfession[];
export const maire: Maire = firstRow(maireRows as Maire[], 'budget_maire');

/** Première et dernière année de la balance de Luynes. */
export const premiereAnnee = firstRow(anneesElus as AnneeElus[], 'budget_elus').annee;
export const derniereAnnee = [...anneesElus].reverse()[0]?.annee ?? premiereAnnee;

export function comparaison(indicateur: IndicateurComparaison): Comparaison {
  const ligne = comparaisons.find((c) => c.indicateur === indicateur);
  if (!ligne) throw new Error(`Comparaison « ${indicateur} » absente : relancer npm run data.`);
  return ligne;
}

/** « 2026-03-22 » → « 22 mars 2026 » */
export function dateLongue(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(iso));
}

/** Date de publication la plus ancienne et date de notification la plus ancienne des marchés (ISO). */
export const premierePublication: string = marches.reduce((min, m) => (m.date_publication !== null && m.date_publication < min ? m.date_publication : min), '9999-12-31');
export const premiereNotification: string = marches.reduce((min, m) => (m.date_notification < min ? m.date_notification : min), '9999-12-31');

export const LIBELLES_COURTS_PROFESSIONS: Record<number, string> = {
  1: 'Agriculteurs',
  2: 'Artisans, commerçants',
  3: 'Cadres, prof. sup.',
  4: 'Prof. intermédiaires',
  5: 'Employés',
  6: 'Ouvriers',
  7: 'Retraités',
};
