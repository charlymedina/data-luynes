/**
 * Données « Sport », générées par `npm run data` (voir data/sql/_sport.sql et sport_*.sql).
 * Sources : INJEP / ministère des Sports (licences par commune de résidence) et recensement des équipements
 * sportifs (RES, « Data ES »).
 */
import resumeRows from './generated/sport_resume.json';
import anneesRows from './generated/sport_annees.json';
import agesRows from './generated/sport_ages.json';
import federationsRows from './generated/sport_federations.json';
import typesRows from './generated/sport_equipements_types.json';
import periodesRows from './generated/sport_equipements_periodes.json';
import listeRows from './generated/sport_equipements_liste.json';
import { firstRow } from './rows';
import type { IconName } from '../lib/icons';

export interface ResumeSport {
  annee_debut: number;
  annee_fin: number;
  population: number;
  licences: number;
  federations: number;
  licences_scolaires: number;
  licences_pour_100: number;
  licences_pour_100_37: number;
  rang_licences: number;
  nb_communes_licences: number;
  femmes_pct: number;
  femmes_pct_37: number;
  evolution_luynes_pct: number;
  evolution_37_pct: number;
  equipements: number;
  installations: number;
  equipements_pour_1000: number;
  equipements_pour_1000_37: number;
  rang_equipements: number;
  nb_communes_equipements: number;
  equipements_localises: number;
  installations_accessibles: number;
  equipements_renoves: number;
  equipements_hors_service: number;
}

export interface AnneeSport {
  annee: number;
  licences: number;
  licences_37: number;
  indice_luynes: number;
  indice_37: number;
}

export interface TrancheAge {
  tranche: string;
  licences: number;
  part_luynes: number;
  part_37: number;
}

export interface FederationSport {
  code: string;
  federation: string;
  scolaire: boolean;
  licences: number;
  femmes_pct: number | null;
  /** Rang parmi les fédérations hors sport scolaire (vide pour le sport scolaire). */
  rang: number | null;
}

export interface TypeEquipement {
  type: string;
  nombre: number;
  installations: number;
}

export interface PeriodeEquipement {
  periode: string;
  nombre: number;
  annee_la_plus_ancienne: number | null;
}

export interface EquipementSport {
  id: string;
  nom: string;
  installation: string;
  adresse: string | null;
  type: string;
  annee_service: number | null;
  periode_service: string | null;
  annee_travaux: number | null;
  lat: number | null;
  lon: number | null;
  nature: string | null;
  ouvert_public: boolean | null;
  acces_libre: boolean | null;
  installation_accessible: boolean;
  hors_service: boolean;
}

export const resumeSport: ResumeSport = firstRow(resumeRows as ResumeSport[], 'sport_resume');
export const anneesSport: readonly AnneeSport[] = anneesRows as AnneeSport[];
export const tranchesAge: readonly TrancheAge[] = agesRows as TrancheAge[];
export const federations: readonly FederationSport[] = federationsRows as FederationSport[];
export const typesEquipements: readonly TypeEquipement[] = typesRows as TypeEquipement[];
export const periodesEquipements: readonly PeriodeEquipement[] = periodesRows as PeriodeEquipement[];
export const equipements: readonly EquipementSport[] = listeRows as EquipementSport[];

/** Fédérations « sportives » (hors sport scolaire et universitaire), de la plus à la moins représentée. */
export const federationsSportives: readonly FederationSport[] = federations.filter((f) => !f.scolaire);
export const federationsScolaires: readonly FederationSport[] = federations.filter((f) => f.scolaire);

/** « FF de Tennis » → « Tennis » ; « … (UFOLEP) » → « UFOLEP » (noms courts pour les pictos et les barres). */
export function nomCourtFederation(nom: string): string {
  const sigle = /\(([^)]+)\)$/.exec(nom)?.[1];
  if (sigle) return sigle;
  return nom
    .replace(/^FF (de la |de l'|de |des |du |d')/i, '')
    .replace(/^FF /, '')
    .replace(/^F Sportive (et|Educative) /i, '')
    .replace(/^./, (c) => c.toUpperCase());
}

/** Icône d'une fédération d'après son code (stable d'une année à l'autre). */
const ICONES_FEDERATIONS: Record<string, IconName> = {
  '123': 'raquette', '124': 'raquette', '103': 'raquette', '141': 'raquette',
  '111': 'ballon', '133': 'ballon', '105': 'ballon', '115': 'ballon', '129': 'ballon',
  '109': 'medaille', '101': 'piste', '125': 'cible', '209': 'cible', '119': 'nage', '221': 'nage',
  '242': 'boule', '245': 'pieton', '218': 'velo', '108': 'velo', '220': 'pion', '113': 'haltere',
  '402': 'haltere', '132': 'medaille',
};
export function iconeFederation(code: string): IconName {
  return ICONES_FEDERATIONS[code] ?? 'medaille';
}

/** Icône d'un type d'équipement (famille du RES ou activité), d'après son libellé. */
export function iconeEquipement(type: string): IconName {
  const t = type.toLowerCase();
  if (/bassin|natation|piscine/.test(t)) return 'nage';
  if (/boule|pétanque|petanque/.test(t)) return 'boule';
  if (/tennis|fronton/.test(t)) return 'raquette';
  if (/grands jeux|football|rugby|multisports|city|basket|handball/.test(t)) return 'ballon';
  if (/athlétisme|athletisme|piste/.test(t)) return 'piste';
  if (/tir/.test(t)) return 'cible';
  if (/échecs|echecs/.test(t)) return 'pion';
  if (/randonn|pédestre/.test(t)) return 'pieton';
  if (/gym|combat|danse|salle/.test(t)) return 'haltere';
  return 'medaille';
}

/** « SALLE DE BOULES DE FORT n°1 » → « Salle de boules de fort n°1 » (les noms du RES sont souvent en capitales). */
export function nomPropre(texte: string): string {
  const lettres = texte.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (lettres === '' || lettres !== lettres.toUpperCase()) return texte;
  const minuscules = texte.toLowerCase();
  return minuscules.charAt(0).toUpperCase() + minuscules.slice(1);
}
