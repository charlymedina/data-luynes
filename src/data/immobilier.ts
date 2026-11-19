/**
 * Données « Immobilier », générées par `npm run data` (voir data/sql/_dvf.sql et immobilier_*.sql).
 */
import ventesRows from './generated/immobilier_ventes.json';
import anneesRows from './generated/immobilier_annees.json';
import resumeRows from './generated/immobilier_resume.json';
import prixRows from './generated/immobilier_prix_maisons.json';
import dpeRows from './generated/immobilier_dpe.json';
import loyersRows from './generated/immobilier_loyers.json';
import { firstRow } from './rows';

export type TypeBien = 'Maison' | 'Appartement' | 'Terrain' | 'Autre';

export interface Vente {
  id: string;
  date: string;
  annee: number;
  type: TypeBien;
  prix: number;
  surface_bati: number | null;
  surface_terrain: number | null;
  pieces: number | null;
  prix_m2: number | null;
  rue: string | null;
  lat: number;
  lon: number;
}

export interface AnneeImmobilier {
  annee: number;
  ventes: number;
  ventes_maisons: number;
  ventes_appartements: number;
  ventes_terrains: number;
  ventes_autres: number;
  prix_m2_maison: number;
  prix_m2_maison_37: number;
  prix_maison: number;
}

export interface ResumeImmobilier {
  premiere_vente: string;
  derniere_vente: string;
  annee_debut: number;
  annee_fin: number;
  ventes: number;
  ventes_maisons: number;
  ventes_appartements: number;
  ventes_terrains: number;
  prix_m2_maison: number;
  prix_m2_appartement: number;
  prix_maison: number;
  surface_maison: number;
  terrain_maison: number;
  maison_la_plus_chere: number;
  montant_total: number;
  prix_m2_maison_37: number;
  prix_maison_37: number;
  rang_prix_m2_maison: number;
  nb_communes_classees: number;
}

export interface TranchePrix {
  debut: number;
  /** null = « et plus » (dernière tranche) */
  fin: number | null;
  ventes: number;
}

export interface EtiquetteDpe {
  etiquette: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  dpe_luynes: number;
  part_luynes: number;
  part_37: number;
  part_france: number;
}

export interface Loyer {
  type_logement: 'Maison' | 'Appartement';
  annee: number;
  loyer_m2: number;
  loyer_m2_bas: number;
  loyer_m2_haut: number;
  niveau_estimation: string;
  annonces_commune: number;
  rang: number;
  nb_communes: number;
  loyer_m2_mediane_37: number;
}

/** Petits mots laissés en minuscules dans les noms de rue (« Rue des Caves », « Chemin de la Barre »). */
const MOTS_MINUSCULES = new Set(['de', 'des', 'du', 'la', 'le', 'les', 'aux', 'au', 'et', 'sur', 'en', 'a']);

/** « RUE DES CAVES » → « Rue des Caves » (DVF écrit les adresses en majuscules, sans accents). */
export function formatRue(rue: string | null): string {
  if (!rue) return 'Adresse non précisée';
  return rue
    .toLowerCase()
    .split(/\s+/)
    .map((mot, i) => {
      if (i > 0 && MOTS_MINUSCULES.has(mot)) return mot;
      if (/^[ld]'/.test(mot)) return `${mot.slice(0, 2)}${mot.charAt(2).toUpperCase()}${mot.slice(3)}`;
      return mot.charAt(0).toUpperCase() + mot.slice(1);
    })
    .join(' ');
}

export const ventes: readonly Vente[] = (ventesRows as Vente[]).map((v) => ({ ...v, rue: formatRue(v.rue) }));
export const annees: readonly AnneeImmobilier[] = anneesRows as AnneeImmobilier[];
export const resumeImmobilier: ResumeImmobilier = firstRow(resumeRows as ResumeImmobilier[], 'immobilier_resume');
export const tranchesPrixMaisons: readonly TranchePrix[] = prixRows as TranchePrix[];
export const etiquettesDpe: readonly EtiquetteDpe[] = dpeRows as EtiquetteDpe[];
export const loyers: readonly Loyer[] = loyersRows as Loyer[];
export const loyerMaison: Loyer | undefined = loyers.find((l) => l.type_logement === 'Maison');
export const loyerAppartement: Loyer | undefined = loyers.find((l) => l.type_logement === 'Appartement');

/**
 * Classes de prix au m² de la carte des ventes (en €/m²) : bornes basses des classes 2 à 5.
 * Même découpage pour la carte (couleurs --seq-1 … --seq-5) et sa légende.
 */
export const SEUILS_PRIX_M2 = [1500, 2000, 2500, 3000] as const;
export const TYPES_BIEN: readonly TypeBien[] = ['Maison', 'Appartement', 'Terrain', 'Autre'];
