/**
 * Données « Accidents de la route », générées par `npm run data` (voir data/sql/_accidents.sql et accidents_*.sql).
 * Source : bases annuelles des accidents corporels (BAAC, ONISR), archivées pour l'Indre-et-Loire.
 */
import resumeRows from './generated/accidents_resume.json';
import anneesRows from './generated/accidents_annees.json';
import listeRows from './generated/accidents_liste.json';
import agesRows from './generated/accidents_ages.json';
import usagersRows from './generated/accidents_usagers.json';
import momentsRows from './generated/accidents_moments.json';
import routesRows from './generated/accidents_routes.json';
import manifesteBaac from '../../data/archive/baac/manifest.json';
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

/** Un accident tel que publié par l'ONISR (sans l'adresse). */
export interface Accident {
  annee: number;
  mois: number;
  jour: number | null;
  /** 1 = lundi … 7 = dimanche */
  jour_semaine: number | null;
  heure: number | null;
  minute: number | null;
  moment: string;
  lumiere: string | null;
  meteo: string | null;
  route: string | null;
  type_route: string | null;
  vitesse_max: number | null;
  etat_chaussee: string | null;
  intersection: string | null;
  collision: string | null;
  agglomeration: string | null;
  gravite: Gravite;
  tues: number;
  hospitalises: number;
  blesses_legers: number;
  vehicules: string | null;
  /** Une ligne par personne : « conducteur · voiture · homme, 34 ans · blessé léger · ceinture ». */
  personnes: string[];
  lat: number | null;
  lon: number | null;
}

/** Accident localisé (pour la carte). */
export type AccidentCarte = Accident & { lat: number; lon: number };

export interface AgeAccidents {
  ordre: number;
  tranche: string;
  personnes_luynes: number;
  part_luynes: number;
  part_37: number;
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
export const accidentsListe: readonly Accident[] = listeRows as Accident[];
export const accidentsCarte: readonly AccidentCarte[] = accidentsListe.filter(
  (a): a is AccidentCarte => a.lat !== null && a.lon !== null,
);
export const agesAccidents: readonly AgeAccidents[] = agesRows as AgeAccidents[];
export const usagersAccidents: readonly UsagerAccidents[] = usagersRows as UsagerAccidents[];
export const momentsAccidents: readonly MomentAccidents[] = momentsRows as MomentAccidents[];
export const routesAccidents: readonly RouteAccidents[] = routesRows as RouteAccidents[];

/**
 * Date de publication, par l'ONISR sur data.gouv.fr, du fichier de la dernière année (lue dans l'adresse du fichier
 * archivé : …/20261030-141517/caract-2025.csv → 30 octobre 2026). `null` si elle n'est pas lisible.
 */
function datePublication(annee: number): Date | null {
  const fichiers = (manifesteBaac as Record<string, Record<string, string>>)[String(annee)];
  const trouve = fichiers?.caract?.match(/\/(\d{4})(\d{2})(\d{2})-\d{6}\//);
  return trouve ? new Date(Number(trouve[1]), Number(trouve[2]) - 1, Number(trouve[3])) : null;
}

export const publicationDerniereAnnee: Date | null = datePublication(resumeAccidents.annee_fin);

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function nomMois(mois: number): string {
  return MOIS[mois - 1] ?? '';
}

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/** « mardi 14 mars 2023 à 17 h 05 » (les parties inconnues sont omises). */
export function dateAccident(a: Accident): string {
  const jourSemaine = a.jour_semaine ? `${JOURS[a.jour_semaine - 1]} ` : '';
  const jour = a.jour ? `${a.jour === 1 ? '1er' : a.jour} ` : '';
  // espaces insécables : « 22 h 40 » ne se coupe jamais en fin de ligne
  const heure = a.heure !== null ? ` à ${a.heure} h ${String(a.minute ?? 0).padStart(2, '0')}` : '';
  return `${jourSemaine}${jour}${nomMois(a.mois)} ${a.annee}${heure}`;
}

/** Conditions et lieu en une phrase : « route départementale D49, 80 km/h · hors intersection · plein jour… ». */
export function conditionsAccident(a: Accident): string {
  const route = [a.type_route, a.route].filter(Boolean).join(' ');
  const vitesse = a.vitesse_max ? `${a.vitesse_max} km/h` : null;
  return [
    [route, vitesse].filter(Boolean).join(', '),
    a.agglomeration,
    a.intersection,
    a.collision,
    a.lumiere,
    a.meteo,
    a.etat_chaussee,
  ]
    .filter((x): x is string => Boolean(x))
    .join(' · ');
}

export const LIBELLE_GRAVITE: Record<Gravite, string> = {
  mortel: 'Accident mortel',
  grave: 'Blessé(s) hospitalisé(s)',
  leger: 'Blessé(s) léger(s)',
};
