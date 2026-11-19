/**
 * Données du thème « Population », générées par `npm run data` (voir data/sql/population_*.sql).
 */
import historiqueRows from './generated/population_historique.json';
import faitsRows from './generated/population_faits.json';
import pyramideRows from './generated/population_pyramide.json';
import agesRows from './generated/population_ages.json';
import evolutionRows from './generated/population_evolution_ages.json';
import naissancesDecesRows from './generated/population_naissances_deces.json';
import { firstRow, lastRow } from './rows';

export interface Recensement {
  annee: number;
  population: number;
}

export interface FaitsPopulation {
  annee_derniere: number;
  population_derniere: number;
  annee_precedente: number;
  population_precedente: number;
  annee_premiere: number;
  population_premiere: number;
  annee_pic: number;
  population_pic: number;
  annee_creux: number;
  population_creux: number;
  multiplie_depuis_1968: number;
  hausse_annee_debut: number;
  hausse_annee_fin: number;
  hausse_par_an: number;
}

export interface TranchePyramide {
  ordre: number;
  libelle: string;
  femmes: number;
  hommes: number;
  part_femmes: number;
  part_hommes: number;
  part_femmes_france: number;
  part_hommes_france: number;
  annee: number;
}

export interface AgesTerritoire {
  territoire: 'Luynes' | 'Indre-et-Loire' | 'France';
  annee: number;
  age_median: number;
  part_moins_20: number;
  part_65_plus: number;
}

export interface EvolutionAges {
  annee: number;
  population: number;
  part_65_plus: number;
  part_moins_20: number;
}

export interface NaissancesDeces {
  annee: number;
  naissances: number;
  deces: number;
  solde_naturel: number;
}

export const historique: readonly Recensement[] = historiqueRows as Recensement[];
export const faits: FaitsPopulation = firstRow(faitsRows as FaitsPopulation[], 'population_faits');
export const pyramide: readonly TranchePyramide[] = pyramideRows as TranchePyramide[];
export const ages: readonly AgesTerritoire[] = agesRows as AgesTerritoire[];
export const evolutionAges: readonly EvolutionAges[] = evolutionRows as EvolutionAges[];
export const naissancesDeces: readonly NaissancesDeces[] = naissancesDecesRows as NaissancesDeces[];

/** Ligne « âges » d'un territoire (Luynes, Indre-et-Loire ou France). */
export function agesDe(territoire: AgesTerritoire['territoire']): AgesTerritoire {
  return firstRow(ages.filter((row) => row.territoire === territoire), `population_ages/${territoire}`);
}

export const derniereAnneeEtatCivil: NaissancesDeces = lastRow(naissancesDeces, 'population_naissances_deces');
