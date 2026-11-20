/**
 * Données « Eau potable », générées par `npm run data` (voir data/sql/_eau.sql et eau_*.sql).
 * Source : contrôle sanitaire de l'eau du robinet (ARS), API Hub'eau « qualité de l'eau potable ».
 */
import resumeRows from './generated/eau_resume.json';
import anneesRows from './generated/eau_annees.json';
import { firstRow } from './rows';

export interface ResumeEau {
  annee_debut: number;
  annee_fin: number;
  prelevements: number;
  conformes_bact: number;
  conformes_pc: number;
  non_conformes_bact: number;
  non_conformes_pc: number;
  fenetre_debut: number;
  fenetre_fin: number;
  nitrates_luynes: number;
  nitrates_max_luynes: number;
  nitrates_37: number;
  durete_luynes: number;
  durete_37: number;
  conformes_bact_fenetre_luynes: number;
  conformes_bact_37: number;
  rang_nitrates: number;
  nb_communes_nitrates: number;
  rang_durete: number | null;
  nb_communes_durete: number;
  distributeur: string | null;
}

export interface AnneeEau {
  annee: number;
  prelevements: number;
  non_conformes_bact: number;
  non_conformes_pc: number;
  nitrates_moyenne: number | null;
  nitrates_max: number | null;
}

export const resumeEau: ResumeEau = firstRow(resumeRows as ResumeEau[], 'eau_resume');
export const anneesEau: readonly AnneeEau[] = anneesRows as AnneeEau[];

/** Limite de qualité réglementaire des nitrates dans l'eau du robinet (mg/L, Code de la santé publique). */
export const LIMITE_NITRATES = 50;
