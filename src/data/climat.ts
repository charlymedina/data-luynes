/**
 * Données « Climat », générées par `npm run data` (voir data/sql/_climat.sql et climat_*.sql).
 * Source : Météo-France, station de Tours (aéroport de Parçay-Meslay) — il n'y a pas de station à Luynes.
 */
import resumeRows from './generated/climat_resume.json';
import anneesRows from './generated/climat_annees.json';
import decenniesRows from './generated/climat_decennies.json';
import moisRows from './generated/climat_mois.json';
import { firstRow } from './rows';

export interface ResumeClimat {
  premiere_annee_mesures: number;
  avant_debut: number;
  avant_fin: number;
  recent_debut: number;
  recent_fin: number;
  temperature_avant: number;
  temperature_recente: number;
  rechauffement: number;
  jours_gel_avant: number;
  jours_gel_recent: number;
  jours_chaleur_avant: number;
  jours_chaleur_recent: number;
  pluie_avant: number;
  pluie_recente: number;
  record_chaleur: number;
  record_chaleur_jour: string;
  record_froid: number;
  record_froid_jour: string;
  record_pluie: number;
  record_pluie_jour: string;
  annee_plus_chaude: number;
  temperature_annee_plus_chaude: number;
  annee_plus_fraiche: number;
  annees_recentes_dans_top10: number;
  distance_station_km: number;
}

export interface AnneeClimat {
  annee: number;
  temperature: number;
  ecart: number;
  jours_gel: number;
  jours_chaleur: number;
  pluie: number;
}

export interface DecennieClimat {
  decennie: number;
  nb_annees: number;
  temperature: number;
  jours_gel: number;
  jours_chaleur: number;
  pluie: number;
}

export interface MoisClimat {
  mois: number;
  pluie: number;
  temperature_min: number;
  temperature_max: number;
}

export const resumeClimat: ResumeClimat = firstRow(resumeRows as ResumeClimat[], 'climat_resume');
export const anneesClimat: readonly AnneeClimat[] = anneesRows as AnneeClimat[];
export const decenniesClimat: readonly DecennieClimat[] = decenniesRows as DecennieClimat[];
export const moisClimat: readonly MoisClimat[] = moisRows as MoisClimat[];

const dateLongue = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** « 2026-06-24 » → « 24 juin 2026 » */
export function formatJour(iso: string): string {
  return dateLongue.format(new Date(`${iso}T00:00:00Z`));
}

export const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export const MOIS_LONGS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
