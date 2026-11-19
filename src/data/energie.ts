/**
 * Données « Énergie & mobilité », générées par `npm run data`
 * (voir data/sql/_energie.sql, energie_*.sql et mobilite_*.sql).
 * Sources : Agence ORE (consommations), ODRÉ (solaire), SDES (parc de véhicules), base nationale IRVE (bornes).
 */
import resumeRows from './generated/energie_resume.json';
import anneesRows from './generated/energie_annees.json';
import secteursRows from './generated/energie_secteurs.json';
import parcRows from './generated/mobilite_parc_annees.json';
import critairRows from './generated/mobilite_critair.json';
import bornesRows from './generated/mobilite_bornes.json';
import { firstRow } from './rows';

export interface ResumeEnergie {
  annee_energie: number;
  nb_communes: number;
  elec_mwh_par_logement: number;
  elec_mwh_par_logement_37: number;
  rang_elec: number;
  nb_communes_elec: number;
  gaz_mwh_par_logement: number;
  gaz_mwh_par_logement_37: number;
  logements_elec: number;
  logements_gaz: number;
  part_logements_gaz_pct: number;
  solaire_kw: number;
  solaire_installations: number;
  solaire_kw_pour_1000: number;
  solaire_kw_pour_1000_37: number;
  rang_solaire: number;
  annee_parc: number;
  annee_parc_debut: number;
  voitures: number;
  part_electrique_pct: number;
  part_electrique_37_pct: number;
  rang_electrique: number;
  nb_communes_parc: number;
  part_diesel_pct: number;
  part_diesel_debut_pct: number;
  part_diesel_37_pct: number;
  bornes_stations: number;
  bornes_points: number;
}

export interface AnneeEnergie {
  annee: number;
  elec_mwh: number;
  gaz_mwh: number;
  elec_mwh_par_logement: number;
  gaz_mwh_par_logement: number;
}

export interface SecteurEnergie {
  annee: number;
  secteur: string;
  mwh: number;
  part_pct: number;
}

export interface AnneeParc {
  annee: number;
  voitures: number;
  essence: number;
  diesel: number;
  hybride: number;
  hybride_rechargeable: number;
  electrique: number;
  autres: number;
  part_electrique_pct: number;
  part_diesel_pct: number;
}

export interface VignetteCritair {
  annee: number;
  /** « E », « 1 » … « 5 », « Non classé » */
  vignette: string;
  voitures_luynes: number;
  part_luynes: number;
  part_37: number;
}

export interface BorneRecharge {
  operateur: string;
  adresse: string;
  points_de_charge: number;
  puissance_max_kw: number;
  gratuit: boolean;
  implantation: string;
  lat: number;
  lon: number;
}

export const resumeEnergie: ResumeEnergie = firstRow(resumeRows as ResumeEnergie[], 'energie_resume');
export const anneesEnergie: readonly AnneeEnergie[] = anneesRows as AnneeEnergie[];
export const secteursEnergie: readonly SecteurEnergie[] = secteursRows as SecteurEnergie[];
export const anneesParc: readonly AnneeParc[] = parcRows as AnneeParc[];
export const vignettesCritair: readonly VignetteCritair[] = critairRows as VignetteCritair[];
/** Stations de recharge situées dans Luynes (la ligne « vide » du SQL signifie « aucune »). */
export const bornesRecharge: readonly BorneRecharge[] = (bornesRows as (BorneRecharge | { points_de_charge: 0 })[]).filter(
  (b): b is BorneRecharge => b.points_de_charge > 0,
);
