/**
 * Liste des sources de données téléchargées avant chaque construction du site.
 * Chaque source est enregistrée dans data/raw/<id>.json, que les requêtes SQL lisent ensuite.
 * Pense à documenter toute nouvelle source dans docs/sources.md (origine, licence, mise à jour).
 */
export interface Source {
  /** Nom du fichier produit dans data/raw/ (sans extension) */
  readonly id: string;
  readonly description: string;
  readonly url: string;
}

const GEO_API = 'https://geo.api.gouv.fr';
const TOURS_METROPOLE = 'https://data.tours-metropole.fr/api/explore/v2.1/catalog/datasets';
/** API « Melodi » de l'INSEE : sans clé, filtrable par territoire (COM-37139 = Luynes, DEP-37, FRANCE). */
const MELODI = 'https://api.insee.fr/melodi/data';

function melodi(dataset: string, geo: string): string {
  return `${MELODI}/${dataset}?GEO=${geo}&maxResult=10000`;
}

export const SOURCES: readonly Source[] = [
  // — Commune et voisines (accueil) —
  {
    id: 'commune',
    description: 'Fiche de Luynes (API Géo)',
    url: `${GEO_API}/communes/37139?fields=nom,code,population,surface,codesPostaux,centre,departement,region`,
  },
  {
    id: 'communes_37',
    description: "Toutes les communes d'Indre-et-Loire (API Géo)",
    url: `${GEO_API}/departements/37/communes?fields=nom,code,population,surface,centre`,
  },

  // — Population —
  {
    id: 'population_historique',
    description: 'Population de Luynes à chaque recensement depuis 1876 (INSEE via Tours Métropole)',
    url: `${TOURS_METROPOLE}/population-1876-2023-tours-metropole-val-de-loire/exports/json?select=annee,population&where=code_geographique%3D%2237139%22&order_by=annee`,
  },
  {
    id: 'age_sexe_luynes',
    description: 'Population par âge et sexe — Luynes (INSEE, recensement)',
    url: melodi('DS_RP_TD_POPULATION_AGESEX_PRINC', 'COM-37139'),
  },
  {
    id: 'age_sexe_37',
    description: 'Population par âge et sexe — Indre-et-Loire (INSEE, recensement)',
    url: melodi('DS_RP_TD_POPULATION_AGESEX_PRINC', 'DEP-37'),
  },
  {
    id: 'age_sexe_france',
    description: 'Population par âge et sexe — France (INSEE, recensement)',
    url: melodi('DS_RP_TD_POPULATION_AGESEX_PRINC', 'FRANCE'),
  },
  {
    id: 'grandes_tranches_luynes',
    description: "Population par grandes tranches d'âge, 2012-2017-2023 — Luynes (INSEE)",
    url: melodi('DS_RP_POPULATION_PRINC', 'COM-37139'),
  },
  {
    id: 'naissances_luynes',
    description: 'Naissances domiciliées à Luynes par année (INSEE, état civil)',
    url: melodi('DS_ETAT_CIVIL_NAIS_COMMUNES', 'COM-37139'),
  },
  {
    id: 'deces_luynes',
    description: 'Décès domiciliés à Luynes par année (INSEE, état civil)',
    url: melodi('DS_ETAT_CIVIL_DECES_COMMUNES', 'COM-37139'),
  },
];
