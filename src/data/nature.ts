/**
 * Données « Nature & paysages », générées par `npm run data`
 * (voir data/sql/_spatial_nature.sql, _nature_gbif.sql et nature_*.sql).
 * Sources : INPN / MNHN (ZNIEFF, Natura 2000), RPG (IGN), INAO (AOC viticoles), GBIF (observations d'espèces).
 */
import resumeRows from './generated/nature_resume.json';
import zonagesRows from './generated/nature_zonages.json';
import cartesRows from './generated/nature_cartes.json';
import culturesRows from './generated/nature_cultures.json';
import culturesTopRows from './generated/nature_cultures_top.json';
import aocRows from './generated/nature_aoc.json';
import bioResumeRows from './generated/nature_biodiversite_resume.json';
import bioGroupesRows from './generated/nature_biodiversite_groupes.json';
import bioTopRows from './generated/nature_biodiversite_top.json';
import bioMenaceesRows from './generated/nature_biodiversite_menacees.json';
import { firstRow } from './rows';
import type { Geometry } from '../lib/map-base';

export interface ResumeNature {
  surface_commune_ha: number;
  nb_znieff: number;
  nb_znieff1: number;
  nb_znieff2: number;
  nb_natura: number;
  zonee_ha: number;
  zonee_pct: number;
  natura_pct: number;
  znieff_pct: number;
  annee_rpg: number;
  annee_rpg_ancienne: number;
  agricole_ha: number;
  agricole_pct: number;
  agricole_ancienne_ha: number;
  agricole_ancienne_pct: number;
  prairies_ha: number;
  prairies_part_agricole_pct: number;
  vignes_ha: number;
  vignes_ancienne_ha: number;
  nb_familles: number;
  aoc_ha: number;
  aoc_pct: number;
  aoc_nb_appellations: number;
}

export interface ZoneProtegee {
  type: 'znieff1' | 'znieff2' | 'natura_habitats' | 'natura_oiseaux';
  type_libelle: string;
  nom: string;
  url: string;
  surface_ha: number;
  part_commune_pct: number;
}

export interface CoucheCarte {
  couche: 'znieff' | 'natura' | 'prairies' | 'vignobles';
  surface_ha: number;
  forme: Geometry;
}

export interface FamilleCultures {
  code_groupe: string;
  famille: string;
  surface_ha: number;
  part_surface_agricole_pct: number;
  part_commune_pct: number;
  surface_ancienne_ha: number;
}

export interface CultureDetail {
  culture: string;
  famille: string;
  surface_ha: number;
}

export interface AppellationAoc {
  appellation: string;
  surface_ha: number;
}

export interface ResumeBiodiversite {
  observations: number;
  especes: number;
  especes_menacees: number;
  plantes_pct: number;
  animaux_pct: number;
  champignons: number;
  observations_humaines_pct: number;
}

export interface GroupeVivant {
  groupe: string;
  regne: 'animaux' | 'plantes' | 'autres';
  observations: number;
  part_pct: number;
}

export interface EspeceObservee {
  espece: string;
  observations: number;
}

export const resumeNature: ResumeNature = firstRow(resumeRows as ResumeNature[], 'nature_resume');
export const zonesProtegees: readonly ZoneProtegee[] = zonagesRows as ZoneProtegee[];
/** DuckDB exporte les formes GeoJSON sous forme de texte : on les relit en objets. */
export const couchesCarte: readonly CoucheCarte[] = (cartesRows as { couche: CoucheCarte['couche']; surface_ha: number; forme: string }[]).map((c) => ({
  ...c,
  forme: JSON.parse(c.forme) as Geometry,
}));
export const famillesCultures: readonly FamilleCultures[] = culturesRows as FamilleCultures[];
export const culturesDetail: readonly CultureDetail[] = culturesTopRows as CultureDetail[];
export const appellations: readonly AppellationAoc[] = aocRows as AppellationAoc[];
export const resumeBiodiversite: ResumeBiodiversite = firstRow(bioResumeRows as ResumeBiodiversite[], 'nature_biodiversite_resume');
export const groupesVivants: readonly GroupeVivant[] = bioGroupesRows as GroupeVivant[];
export const especesTop: readonly EspeceObservee[] = bioTopRows as EspeceObservee[];
export const especesMenacees: readonly EspeceObservee[] = bioMenaceesRows as EspeceObservee[];

/**
 * Les noms de ZNIEFF sont publiés en MAJUSCULES (« ILE QUINQUENGROGNE ») : on les met en forme lisible
 * (« Île Quinquengrogne »). Les autres noms (déjà en casse normale) restent tels quels.
 */
export function nomZone(nom: string): string {
  if (nom !== nom.toUpperCase()) return nom;
  const minuscules = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'aux', 'au', 'sur', 'en', "l'", "d'"]);
  return nom
    .toLowerCase()
    .split(/(\s+|(?<=')|(?<=-))/)
    .map((mot, i) => (i > 0 && minuscules.has(mot) ? mot : mot.charAt(0).toUpperCase() + mot.slice(1)))
    .join('')
    .replace(/^Ile\b/, 'Île')
    .replace(/ Ilots\b/, ' Îlots');
}
