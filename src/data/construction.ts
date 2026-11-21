/**
 * Données « Construction & logement social », générées par `npm run data`
 * (voir data/sql/_construction.sql et construction_*.sql). Sources : Sitadel et RPLS (SDES).
 */
import resumeRows from './generated/construction_resume.json';
import anneesRows from './generated/construction_annees.json';
import sociauxRows from './generated/construction_sociaux.json';
import { firstRow } from './rows';

export interface ResumeConstruction {
  annee_debut: number;
  annee_fin: number;
  commences_total: number;
  autorises_total: number;
  commences_par_an: number;
  commences_par_an_10_ans: number;
  part_collectifs: number;
  annee_record: number;
  commences_record: number;
  logements_sociaux: number;
  annee_rpls: number;
  surface_moyenne_sociaux: number;
  sociaux_recents: number;
  part_passoires_sociaux: number | null;
}

export interface AnneeConstruction {
  annee: number;
  autorises: number;
  commences: number;
  commences_collectifs: number;
  complete: boolean;
}

export interface GroupeSociaux {
  dimension: 'pieces' | 'epoque';
  ordre: number;
  libelle: string;
  logements: number;
}

export const resumeConstruction: ResumeConstruction = firstRow(resumeRows as ResumeConstruction[], 'construction_resume');
/** Années complètes seulement (l'année en cours, partielle, fausserait la comparaison). */
export const anneesConstruction: readonly AnneeConstruction[] = (anneesRows as AnneeConstruction[]).filter((a) => a.complete);
export const sociauxParPieces: readonly GroupeSociaux[] = (sociauxRows as GroupeSociaux[]).filter((g) => g.dimension === 'pieces');
export const sociauxParEpoque: readonly GroupeSociaux[] = (sociauxRows as GroupeSociaux[]).filter((g) => g.dimension === 'epoque');
