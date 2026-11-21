/**
 * Données « Eau potable », générées par `npm run data` (voir data/sql/_eau.sql et eau_*.sql).
 * Source : contrôle sanitaire de l'eau du robinet (ARS), API Hub'eau « qualité de l'eau potable ».
 */
import resumeRows from './generated/eau_resume.json';
import anneesRows from './generated/eau_annees.json';
import pompageResumeRows from './generated/eau_pompage_resume.json';
import pompageAnneesRows from './generated/eau_pompage_annees.json';
import pompageOuvragesRows from './generated/eau_pompage_ouvrages.json';
import { firstRow } from './rows';

export interface ResumeEau {
  annee_debut: number;
  annee_fin: number;
  prelevements: number;
  conformes_bact: number;
  evalues_bact: number;
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

/** Eau puisée sous Luynes (BNPE via Hub'eau « prélèvements »), voir data/sql/eau_pompage_*.sql. */
export interface ResumePompage {
  annee: number;
  annee_debut: number;
  m3_piscine_olympique: number;
  potable_m3: number;
  potable_m3_debut: number;
  autres_usages_m3: number;
  ouvrages_potable: number;
  ouvrages_total: number;
  ouvrages_autres_actifs: number;
}

export interface AnneePompage {
  annee: number;
  potable_m3: number | null;
  irrigation_m3: number | null;
  autre_m3: number | null;
}

export interface OuvragePompage {
  nom_ouvrage: string;
  usage: 'potable' | 'irrigation' | 'autre';
  annee: number;
  volume_m3: number;
}

export const resumePompage: ResumePompage = firstRow(pompageResumeRows as ResumePompage[], 'eau_pompage_resume');
export const anneesPompage: readonly AnneePompage[] = pompageAnneesRows as AnneePompage[];
export const ouvragesPompage: readonly OuvragePompage[] = pompageOuvragesRows as OuvragePompage[];
