/**
 * Données « Budget de la commune », générées par `npm run data` (voir data/sql/_budget.sql et budget_*.sql).
 * Source : comptes individuels des communes (DGFiP). « Strate » = moyenne des communes de même taille.
 */
import anneesRows from './generated/budget_annees.json';
import resumeRows from './generated/budget_resume.json';
import { firstRow } from './rows';

export interface AnneeBudget {
  annee: number;
  population: number;
  depenses_hab: number;
  depenses_hab_strate: number;
  recettes_hab: number;
  recettes_hab_strate: number;
  equipement_hab: number;
  equipement_hab_strate: number;
  dette_hab: number;
  dette_hab_strate: number;
  caf_hab: number;
  caf_hab_strate: number;
  taux_foncier: number;
  taux_foncier_strate: number;
}

export interface ResumeBudget {
  annee: number;
  population: number;
  strate: string;
  recettes: number;
  depenses: number;
  investissement: number;
  equipement: number;
  caf: number;
  dette: number;
  annuite: number;
  part_personnel: number;
  part_achats: number;
  part_subventions: number;
  part_contingents: number;
  part_interets: number;
  part_autres_depenses: number;
  part_impots_locaux: number;
  part_dotation_etat: number;
  part_autres_recettes: number;
  depenses_hab: number;
  depenses_hab_strate: number;
  recettes_hab: number;
  recettes_hab_strate: number;
  equipement_hab: number;
  equipement_hab_strate: number;
  dette_hab: number;
  dette_hab_strate: number;
  caf_hab: number;
  caf_hab_strate: number;
  impots_hab: number;
  impots_hab_strate: number;
  taux_foncier: number;
  taux_foncier_strate: number;
  annees_desendettement: number | null;
  nb_communes: number;
  rang_depenses: number;
  rang_dette: number;
  rang_taux_foncier: number;
  rang_equipement: number;
  depenses_hab_37: number;
  dette_hab_37: number;
  taux_foncier_37: number;
  equipement_hab_37: number;
  communes_sans_dette_37: number;
  equipement_10_ans: number;
  dette_hab_max: number;
  annee_dette_max: number;
  premiere_annee: number;
}

export const anneesBudget: readonly AnneeBudget[] = anneesRows as AnneeBudget[];
export const resumeBudget: ResumeBudget = firstRow(resumeRows as ResumeBudget[], 'budget_resume');

/**
 * Réforme de la taxe d'habitation : depuis 2021, le taux de taxe foncière des communes inclut l'ancienne
 * part du département. Le saut de taux cette année-là n'est donc pas une hausse votée par la commune.
 */
export const ANNEE_REFORME_FONCIER = 2021;

/**
 * Première année depuis laquelle le taux de taxe foncière voté par Luynes est resté identique,
 * en neutralisant le transfert de la part départementale de 2021 (null si la série est vide).
 */
export function anneeTauxStable(): number | null {
  let debut: number | null = null;
  for (let i = anneesBudget.length - 1; i >= 0; i--) {
    const annee = anneesBudget[i];
    const suivante = anneesBudget[i + 1];
    if (!annee) break;
    const changement = suivante && suivante.taux_foncier !== annee.taux_foncier && suivante.annee !== ANNEE_REFORME_FONCIER;
    if (changement) break;
    debut = annee.annee;
  }
  return debut;
}
