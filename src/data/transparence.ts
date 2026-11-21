/**
 * Données « Transparence », générées par `npm run data` (voir data/sql/_transparence.sql et transparence_*.sql).
 * Sources : balances comptables (DGFiP), marchés publics (DECP), appels d'offres (BOAMP), répertoire national des élus.
 * Aucun nom d'élu, sauf celui du maire (information publique du répertoire).
 */
import depensesRows from './generated/transparence_depenses.json';
import elusRows from './generated/transparence_elus.json';
import subventionsRows from './generated/transparence_subventions.json';
import comparaisonRows from './generated/transparence_comparaison.json';
import marchesRows from './generated/transparence_marches.json';
import appelsOffresRows from './generated/transparence_appels_offres.json';
import conseilResumeRows from './generated/transparence_conseil_resume.json';
import conseilAgesRows from './generated/transparence_conseil_ages.json';
import conseilCspRows from './generated/transparence_conseil_csp.json';
import maireRows from './generated/transparence_maire.json';
import { firstRow } from './rows';

export type PosteDepense =
  | 'personnel'
  | 'achats'
  | 'entretien'
  | 'services'
  | 'subventions'
  | 'contributions'
  | 'elus'
  | 'interets'
  | 'autres';

export interface LigneDepense {
  annee: number;
  poste: PosteDepense;
  montant: number;
  pour_100_euros: number;
  euros_par_habitant: number;
  total_annee: number;
  population: number;
}

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

export const lignesDepenses: readonly LigneDepense[] = depensesRows as LigneDepense[];
export const anneesElus: readonly AnneeElus[] = elusRows as AnneeElus[];
export const anneesSubventions: readonly AnneeSubventions[] = subventionsRows as AnneeSubventions[];
export const comparaisons: readonly Comparaison[] = comparaisonRows as Comparaison[];
export const marches: readonly Marche[] = marchesRows as Marche[];
export const appelsOffres: readonly AppelOffres[] = appelsOffresRows as AppelOffres[];
export const conseil: ConseilResume = firstRow(conseilResumeRows as ConseilResume[], 'transparence_conseil_resume');
export const tranchesAge: readonly TrancheAge[] = conseilAgesRows as TrancheAge[];
export const professions: readonly CategorieProfession[] = conseilCspRows as CategorieProfession[];
export const maire: Maire = firstRow(maireRows as Maire[], 'transparence_maire');

/** Première et dernière année de la balance de Luynes. */
export const premiereAnnee = firstRow(anneesElus as AnneeElus[], 'transparence_elus').annee;
export const derniereAnnee = [...anneesElus].reverse()[0]?.annee ?? premiereAnnee;

/** Postes de dépenses d'une année, du plus important au plus petit. */
export function postesDe(annee: number): LigneDepense[] {
  return lignesDepenses.filter((l) => l.annee === annee).sort((a, b) => b.montant - a.montant);
}

export function comparaison(indicateur: IndicateurComparaison): Comparaison {
  const ligne = comparaisons.find((c) => c.indicateur === indicateur);
  if (!ligne) throw new Error(`Comparaison « ${indicateur} » absente : relancer npm run data.`);
  return ligne;
}

/** Libellés des postes, dans l'ordre d'affichage des détails (pictogrammes : voir la page). */
export const LIBELLES_POSTES: Record<PosteDepense, string> = {
  personnel: 'Personnel communal',
  achats: 'Achats, énergie, fournitures',
  entretien: 'Entretien, locations, assurances',
  services: 'Prestations, honoraires, fêtes, taxes',
  subventions: 'Subventions aux associations et au CCAS',
  contributions: 'Contributions obligatoires (incendie, syndicats…)',
  elus: 'Indemnités des élus et cotisations',
  interets: "Intérêts d'emprunts",
  autres: 'Autres dépenses',
};

/** Grands groupes pour la grille de 100 cases (4 couleurs au plus). */
export const GROUPES_POSTES: readonly { label: string; postes: readonly PosteDepense[] }[] = [
  { label: 'Personnel communal', postes: ['personnel'] },
  { label: 'Achats, énergie, entretien, services', postes: ['achats', 'entretien', 'services'] },
  { label: 'Subventions et contributions', postes: ['subventions', 'contributions'] },
  { label: 'Élus, intérêts et autres', postes: ['elus', 'interets', 'autres'] },
];

/** Part (sur 100 €) d'un groupe de postes pour une année. */
export function partGroupe(annee: number, postes: readonly PosteDepense[]): number {
  return lignesDepenses.filter((l) => l.annee === annee && postes.includes(l.poste)).reduce((s, l) => s + l.pour_100_euros, 0);
}

/** « 2026-03-22 » → « 22 mars 2026 » */
export function dateLongue(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(iso));
}

/** Date de publication la plus ancienne et date de notification la plus ancienne des marchés (ISO). */
export const premierePublication: string = marches.reduce((min, m) => (m.date_publication !== null && m.date_publication < min ? m.date_publication : min), '9999-12-31');
export const premiereNotification: string = marches.reduce((min, m) => (m.date_notification < min ? m.date_notification : min), '9999-12-31');

/** Libellés courts (barres de comparaison). */
export const LIBELLES_COURTS_POSTES: Record<PosteDepense, string> = {
  personnel: 'Personnel',
  achats: 'Achats, énergie',
  entretien: 'Entretien, assurances',
  services: 'Services, fêtes',
  subventions: 'Subventions',
  contributions: 'Contributions',
  elus: 'Élus',
  interets: 'Intérêts',
  autres: 'Autres',
};

export const LIBELLES_COURTS_PROFESSIONS: Record<number, string> = {
  1: 'Agriculteurs',
  2: 'Artisans, commerçants',
  3: 'Cadres, prof. sup.',
  4: 'Prof. intermédiaires',
  5: 'Employés',
  6: 'Ouvriers',
  7: 'Retraités',
};
