/**
 * Point d'accès typé aux données générées par `npm run data` (voir data/sql/).
 * Un fichier SQL = un fichier JSON = une interface ici.
 */
import communeRows from './generated/commune.json';
import rangRows from './generated/rang_departement.json';
import voisinesRows from './generated/voisines.json';
import meta from './generated/meta.json';

export interface Commune {
  nom: string;
  code_insee: string;
  code_postal: string;
  population: number;
  surface_km2: number;
  densite_hab_km2: number;
  departement: string;
  region: string;
}

export interface RangDepartement {
  rang_population: number;
  rang_surface: number;
  nb_communes: number;
  densite_departement: number;
}

export interface Voisine {
  code: string;
  nom: string;
  population: number;
  distance_km: number;
  est_luynes: boolean;
}

function firstRow<T>(rows: readonly T[], name: string): T {
  const row = rows[0];
  if (row === undefined) throw new Error(`Données « ${name} » vides : relancer npm run data.`);
  return row;
}

export const commune: Commune = firstRow(communeRows as Commune[], 'commune');
export const rang: RangDepartement = firstRow(rangRows as RangDepartement[], 'rang_departement');
export const voisines: readonly Voisine[] = voisinesRows as Voisine[];
export const generatedAt: Date = new Date(meta.generatedAt);
