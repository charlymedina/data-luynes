/**
 * Données « commune » et classement départemental, générées par `npm run data`
 * (voir data/sql/commune.sql, rang_departement.sql, territoire_communes.sql et _departement.sql).
 * Un fichier SQL = un fichier JSON = une interface ici.
 */
import communeRows from './generated/commune.json';
import rangRows from './generated/rang_departement.json';
import territoireRows from './generated/territoire_communes.json';
import meta from './generated/meta.json';
import { firstRow } from './rows';

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

/** Rang de Luynes parmi les communes d'Indre-et-Loire (1 = la plus grande valeur). */
export interface RangDepartement {
  nb_communes: number;
  rang_population: number;
  rang_surface: number;
  rang_densite: number;
  rang_evolution: number;
  rang_65_plus: number;
  rang_moins_20: number;
  densite_departement: number;
  surface_moyenne_km2: number;
  surface_mediane_km2: number;
  annee_debut: number;
  annee_fin: number;
  evolution_pct: number;
  evolution_departement_pct: number;
  part_65_plus_departement: number;
}

/** Une commune d'Indre-et-Loire, dans l'ordre de densité décroissante. */
export interface CommuneDepartement {
  rang_densite: number;
  nom: string;
  population: number;
  surface_km2: number;
  densite_hab_km2: number;
  est_luynes: boolean;
}

export const commune: Commune = firstRow(communeRows as Commune[], 'commune');
export const rang: RangDepartement = firstRow(rangRows as RangDepartement[], 'rang_departement');
export const communesDepartement: readonly CommuneDepartement[] = territoireRows as CommuneDepartement[];
export const generatedAt: Date = new Date(meta.generatedAt);
