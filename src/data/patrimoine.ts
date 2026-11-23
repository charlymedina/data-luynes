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
import objetsRows from './generated/patrimoine_objets.json';
import objetsSiecleRows from './generated/patrimoine_objets_siecles.json';
import objetsResumeRows from './generated/patrimoine_objets_resume.json';
import batiResumeRows from './generated/patrimoine_bati_resume.json';
import batiPeriodesRows from './generated/patrimoine_bati_periodes.json';
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

/** Objet mobilier (ou ensemble) protégé au titre des monuments historiques — base Palissy. */
export interface ObjetProtege {
  reference: string;
  nom: string;
  denomination: string;
  lieu: string;
  siecle: number | null;
  annee_protection: number | null;
  protection: 'classé' | 'inscrit';
  proprietaire: string;
}

export interface SiecleObjets {
  siecle: number;
  objets: number;
}

export interface ResumeObjets {
  objets: number;
  classes: number;
  lieux: number;
  siecle_min: number;
  siecle_max: number;
  premiere_protection: number;
  derniere_protection: number;
  lieu_principal: string;
  objets_lieu_principal: number;
}

export const objetsProteges: readonly ObjetProtege[] = objetsRows as ObjetProtege[];
export const objetsParSiecle: readonly SiecleObjets[] = objetsSiecleRows as SiecleObjets[];
export const resumeObjets: ResumeObjets = firstRow(objetsResumeRows as ResumeObjets[], 'patrimoine_objets_resume');

/** Âge du bâti d'après la BD TOPO (IGN) : la date de construction n'est connue que pour une partie des bâtiments. */
export interface ResumeBati {
  batiments: number;
  batiments_dates: number;
  part_dates_pct: number;
  residentiels: number;
  residentiels_dates: number;
  part_residentiels_dates_pct: number;
  plus_ancien_annee: number;
  plus_ancien_usage: string;
  plus_recent_annee: number;
  annee_mediane_residentiels: number;
  hauteur_max: number;
  hauteur_max_nature: string;
}

/** Une période de construction (découpage du recensement INSEE) : bâtiments d'habitation datés et résidences principales. */
export interface PeriodeBati {
  ordre: number;
  periode: string;
  batiments: number;
  part_batiments_pct: number;
  logements: number;
  part_logements_pct: number;
  part_logements_37_pct: number;
  part_logements_france_pct: number;
  annee_recensement: number;
}

export const resumeBati: ResumeBati = firstRow(batiResumeRows as ResumeBati[], 'patrimoine_bati_resume');
export const periodesBati: readonly PeriodeBati[] = batiPeriodesRows as PeriodeBati[];
