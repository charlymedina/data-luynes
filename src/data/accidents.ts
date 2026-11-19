/**
 * Données « Accidents de la route », générées par `npm run data` (voir data/sql/_accidents.sql et accidents_*.sql).
 * Source : bases annuelles des accidents corporels (BAAC, ONISR), archivées pour l'Indre-et-Loire.
 */
import resumeRows from './generated/accidents_resume.json';
import anneesRows from './generated/accidents_annees.json';
import carteRows from './generated/accidents_carte.json';
import usagersRows from './generated/accidents_usagers.json';
import momentsRows from './generated/accidents_moments.json';
import routesRows from './generated/accidents_routes.json';
import { firstRow } from './rows';

export interface ResumeAccidents {
  annee_debut: number;
  annee_fin: number;
  nb_annees: number;
  accidents: number;
  accidents_mortels: number;
  accidents_graves: number;
  accidents_legers: number;
  tues: number;
  hospitalises: number;
  blesses_legers: number;
  accidents_geolocalises: number;
  accidents_5_ans: number;
  accidents_5_premieres_annees: number;
  accidents_derniere_annee: number;
  annees_sans_accident: number;
  taux_luynes: number;
  taux_37: number;
  part_graves_luynes: number;
  part_graves_37: number;
  rang_taux: number;
  nb_communes: number;
}

export interface AnneeAccidents {
  annee: number;
  accidents: number;
  accidents_graves: number;
}

export type Gravite = 'mortel' | 'grave' | 'leger';

export interface AccidentCarte {
  annee: number;
  mois: number;
  moment: string;
  lumiere: string | null;
  meteo: string | null;
  route: string | null;
  gravite: Gravite;
  impliques: string;
  lat: number;
  lon: number;
}

export type ModeAccident = 'voiture' | 'deux_roues' | 'pieton' | 'velo' | 'poids_lourd' | 'trottinette';

export interface UsagerAccidents {
  mode: ModeAccident;
  libelle: string;
  accidents_luynes: number;
  part_luynes: number;
  part_37: number;
}

export interface MomentAccidents {
  dimension: 'moment' | 'jour';
  libelle: string;
  accidents_luynes: number;
  part_luynes: number;
  part_37: number;
}

export interface RouteAccidents {
  route: string;
  est_autres: boolean;
  accidents: number;
  accidents_graves: number;
}

export const resumeAccidents: ResumeAccidents = firstRow(resumeRows as ResumeAccidents[], 'accidents_resume');
export const anneesAccidents: readonly AnneeAccidents[] = anneesRows as AnneeAccidents[];
export const accidentsCarte: readonly AccidentCarte[] = carteRows as AccidentCarte[];
export const usagersAccidents: readonly UsagerAccidents[] = usagersRows as UsagerAccidents[];
export const momentsAccidents: readonly MomentAccidents[] = momentsRows as MomentAccidents[];
export const routesAccidents: readonly RouteAccidents[] = routesRows as RouteAccidents[];

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function nomMois(mois: number): string {
  return MOIS[mois - 1] ?? '';
}

export const LIBELLE_GRAVITE: Record<Gravite, string> = {
  mortel: 'Accident mortel',
  grave: 'Blessé(s) hospitalisé(s)',
  leger: 'Blessé(s) léger(s)',
};
