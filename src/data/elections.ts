/**
 * Données « Élections », générées par `npm run data` (voir data/sql/_elections.sql et elections_*.sql).
 * Sources : résultats agrégés par bureau de vote (data.gouv.fr, archivés dans data/archive/elections/)
 * et fichiers officiels des municipales 2026 (ministère de l'Intérieur).
 */
import participationRows from './generated/elections_participation.json';
import derniersRows from './generated/elections_derniers.json';
import resultatsRows from './generated/elections_resultats.json';
import municipalesRows from './generated/elections_municipales.json';
import resumeRows from './generated/elections_resume.json';
import { firstRow } from './rows';

/** pres, legi, euro, muni, regi, dpmt (les cantonales d'avant 2015 sont rangées avec les départementales) */
export type FamilleScrutin = 'pres' | 'legi' | 'euro' | 'muni' | 'regi' | 'dpmt';

export interface Participation {
  id_election: string;
  annee: number;
  tour: number;
  famille: FamilleScrutin;
  type: string;
  inscrits: number;
  votants: number;
  bureaux: number;
  participation_luynes: number;
  /** null quand le fichier source ne couvre qu'une partie du territoire (ex. municipales 2008) : pas de comparaison */
  participation_37: number | null;
  participation_france: number | null;
}

export interface DernierScrutin {
  id_election: string;
  famille: FamilleScrutin;
  type: string;
  annee: number;
  inscrits: number;
  participation_luynes: number;
  participation_37: number;
  participation_france: number;
  rang: number;
  nb_communes: number;
}

export interface ResultatCandidat {
  id_election: string;
  famille: FamilleScrutin;
  type: string;
  annee: number;
  tour: number;
  libelle: string;
  /** Nombre de candidats regroupés (1, sauf pour la ligne « Autres ») */
  nombre: number;
  voix_luynes: number;
  part_luynes: number;
  /** Seulement pour la présidentielle et les européennes */
  part_37: number | null;
  part_france: number | null;
  autres: boolean;
}

export interface ListeMunicipale {
  panneau: number;
  liste: string;
  tete_de_liste: string | null;
  voix_t1: number | null;
  part_t1: number | null;
  voix_t2: number | null;
  part_t2: number | null;
  sieges_cm: number;
  sieges_cc: number;
}

export interface ResumeElections {
  premiere_annee: number;
  nb_tours: number;
  dernier_type: string;
  derniere_annee: number;
  dernier_tour: number;
  inscrits: number;
  bureaux: number;
  record_haut_type: string;
  record_haut_annee: number;
  record_haut_participation: number;
  record_bas_type: string;
  record_bas_annee: number;
  record_bas_participation: number;
  fois_au_dessus_france: number;
  nb_premiers_tours: number;
}

export const participations: readonly Participation[] = participationRows as Participation[];
export const derniersScrutins: readonly DernierScrutin[] = derniersRows as DernierScrutin[];
export const resultats: readonly ResultatCandidat[] = resultatsRows as ResultatCandidat[];
export const municipales: readonly ListeMunicipale[] = municipalesRows as ListeMunicipale[];
export const resumeElections: ResumeElections = firstRow(resumeRows as ResumeElections[], 'elections_resume');

/** Dernier scrutin d'une famille (1er tour), s'il existe. */
export function dernierDe(famille: FamilleScrutin): DernierScrutin | undefined {
  return derniersScrutins.find((d) => d.famille === famille);
}

/** Premiers tours d'une famille de scrutins, du plus ancien au plus récent. */
export function premiersTours(famille: FamilleScrutin): Participation[] {
  return participations.filter((p) => p.famille === famille && p.tour === 1);
}
