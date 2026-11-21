/**
 * Données « Vie quotidienne », générées par `npm run data` (voir data/sql/_quotidien.sql et quotidien_*.sql).
 * Sources : ARCEP (fibre), Géo'DAE (défibrillateurs), Registre de preuve de covoiturage, Tours Métropole (mobilier urbain).
 */
import fibreResumeRows from './generated/quotidien_fibre_resume.json';
import fibreTrimestresRows from './generated/quotidien_fibre_trimestres.json';
import daeResumeRows from './generated/quotidien_dae_resume.json';
import covoiturageRows from './generated/quotidien_covoiturage.json';
import mobilierRows from './generated/quotidien_mobilier.json';
import carteRows from './generated/quotidien_carte.json';
import { firstRow, lastRow } from './rows';

export interface ResumeFibre {
  date_fin: string;
  date_debut: string;
  locaux: number;
  fibre: number;
  sans_fibre: number;
  fibre_pct: number;
  fibre_pct_37: number;
  rang: number;
  nb_communes: number;
  communes_100_pct: number;
  fibre_pct_debut: number;
  fibre_pct_37_debut: number;
  gain_dernier_trimestre_points: number;
}

export interface TrimestreFibre {
  date_fin: string;
  annee: number;
  trimestre: number;
  locaux: number;
  fibre: number;
  luynes_pct: number;
  departement_pct: number;
}

export interface ResumeDae {
  defibrillateurs: number;
  exterieurs: number;
  permanents: number;
  exterieurs_permanents: number;
  pour_1000: number;
  pour_1000_37: number;
  rang: number;
  nb_communes: number;
  total_37: number;
  communes_sans: number;
}

export interface AnneeCovoiturage {
  annee: number;
  trajets: number;
  pour_1000: number;
  trajets_37: number;
  pour_1000_37: number;
  communes_37_avec_trajets: number;
}

export interface ResumeMobilier {
  bancs: number;
  textile: number;
  verre: number;
  verre_habitants_par_point: number;
  verre_habitants_par_point_metropole: number;
  verre_rang: number;
  verre_nb_communes: number;
  verre_points_metropole: number;
}

export type CoucheQuotidien = 'defibrillateurs' | 'verre' | 'textile' | 'bancs';

export interface PointQuotidien {
  couche: CoucheQuotidien;
  libelle: string;
  lat: number;
  lon: number;
}

export const resumeFibre: ResumeFibre = firstRow(fibreResumeRows as ResumeFibre[], 'quotidien_fibre_resume');
export const trimestresFibre: readonly TrimestreFibre[] = fibreTrimestresRows as TrimestreFibre[];
export const resumeDae: ResumeDae = firstRow(daeResumeRows as ResumeDae[], 'quotidien_dae_resume');
export const anneesCovoiturage: readonly AnneeCovoiturage[] = covoiturageRows as AnneeCovoiturage[];
export const derniereAnneeCovoiturage: AnneeCovoiturage = lastRow(anneesCovoiturage, 'quotidien_covoiturage');
export const resumeMobilier: ResumeMobilier = firstRow(mobilierRows as ResumeMobilier[], 'quotidien_mobilier');
export const pointsQuotidien: readonly PointQuotidien[] = carteRows as PointQuotidien[];

export const pointsDeCouche = (couche: CoucheQuotidien): PointQuotidien[] => pointsQuotidien.filter((p) => p.couche === couche);

/** « T2 2026 » à partir d'un trimestre de l'ARCEP. */
export const libelleTrimestre = (t: Pick<TrimestreFibre, 'annee' | 'trimestre'>): string => `T${t.trimestre} ${t.annee}`;

/** Trimestre de la dernière publication (ex. « T2 2026 »). */
export const dernierTrimestreFibre: string = libelleTrimestre(lastRow(trimestresFibre, 'quotidien_fibre_trimestres'));
export const premierTrimestreFibre: string = libelleTrimestre(firstRow(trimestresFibre, 'quotidien_fibre_trimestres'));
