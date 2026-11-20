/**
 * Données « Patrimoine & risques », générées par `npm run data`
 * (voir data/sql/patrimoine_*.sql et risques_*.sql).
 */
import monumentsRows from './generated/patrimoine_monuments.json';
import resumeRows from './generated/patrimoine_risques_resume.json';
import contourRows from './generated/patrimoine_contour.json';
import cavitesRows from './generated/risques_cavites.json';
import catnatRows from './generated/risques_catnat.json';
import mouvementsRows from './generated/risques_mouvements.json';
import zonesInondablesRows from './generated/risques_zones_inondables.json';
import { firstRow } from './rows';

export interface Monument {
  reference: string;
  nom: string;
  type: string;
  protection: 'classé' | 'inscrit';
  protection_partielle: boolean;
  annee_protection: number;
  epoque: string;
  proprietaire: string;
  latitude: number;
  longitude: number;
}

export interface Cavite {
  type: string;
  latitude: number;
  longitude: number;
}

export interface ArreteCatnat {
  date_evenement: string;
  annee: number;
  risque: string;
}

export interface MouvementTerrain {
  annee: number;
  type: string;
}

export interface ResumePatrimoineRisques {
  nb_communes: number;
  monuments: number;
  rang_monuments: number;
  moyenne_monuments_departement: number;
  monuments_classes: number;
  premiere_protection: number;
  cavites: number;
  rang_cavites: number;
  moyenne_cavites_departement: number;
  nb_communes_avec_cavites: number;
  catnat: number;
  rang_catnat: number;
  moyenne_catnat_departement: number;
  catnat_secheresse: number;
  catnat_mouvement: number;
  catnat_inondation: number;
  catnat_premiere_annee: number;
  catnat_derniere_annee: number;
  /** Arrêtés distincts (un arrêté peut reconnaître plusieurs événements : « catnat » compte les reconnaissances) */
  catnat_arretes: number;
  mouvements: number;
  mouvement_plus_ancien: number;
  mouvement_plus_recent: number;
  risques_recenses: string;
}

/** Géométrie GeoJSON (Polygon ou MultiPolygon) du contour de la commune. */
export interface ContourGeometry {
  type: string;
  coordinates: unknown;
}

/** Zone inondable de la Loire à Luynes (crue de référence), découpée à la limite de la commune. */
export interface ZoneInondable {
  surface_ha: number;
  part_commune_pct: number;
  zone: ContourGeometry;
}

export const monuments: readonly Monument[] = monumentsRows as Monument[];
/** DuckDB exporte la forme GeoJSON sous forme de texte : on la relit en objet. */
const zoneBrute = firstRow(zonesInondablesRows as { surface_ha: number; part_commune_pct: number; zone: string }[], 'risques_zones_inondables');
export const zoneInondable: ZoneInondable = { ...zoneBrute, zone: JSON.parse(zoneBrute.zone) as ContourGeometry };
export const cavites: readonly Cavite[] = cavitesRows as Cavite[];
export const arretesCatnat: readonly ArreteCatnat[] = catnatRows as ArreteCatnat[];
export const mouvementsTerrain: readonly MouvementTerrain[] = mouvementsRows as MouvementTerrain[];
export const resumeRisques: ResumePatrimoineRisques = firstRow(resumeRows as ResumePatrimoineRisques[], 'patrimoine_risques_resume');
export const contourCommune: ContourGeometry = firstRow(contourRows as { contour: ContourGeometry }[], 'patrimoine_contour').contour;
