/**
 * Liste des sources de données téléchargées avant chaque construction du site.
 * Chaque source est enregistrée dans data/raw/<id>.json, que les requêtes SQL lisent ensuite.
 * Pense à documenter toute nouvelle source dans docs/sources.md (origine, licence, mise à jour).
 */
import { readFile } from 'node:fs/promises';

export interface Source {
  /** Nom du fichier produit dans data/raw/ (sans extension) */
  readonly id: string;
  readonly description: string;
  /**
   * Adresse à télécharger. Peut être calculée juste avant le téléchargement à partir d'une source
   * déjà téléchargée (les sources sont récupérées dans l'ordre de cette liste).
   */
  readonly url: string | (() => Promise<string | string[]>);
  /**
   * Réponse découpée en pages, fusionnées dans un seul fichier { "data": [...] } :
   *  - « georisques » : API Géorisques (champ total_pages, paramètre page) ;
   *  - « tabular »    : API tabulaire data.gouv (lien links.next).
   */
  readonly pagination?: 'georisques' | 'tabular';
}

const GEO_API = 'https://geo.api.gouv.fr';
const TOURS_METROPOLE = 'https://data.tours-metropole.fr/api/explore/v2.1/catalog/datasets';
/** API « Melodi » de l'INSEE : sans clé, filtrable par territoire (COM-37139 = Luynes, DEP-37, FRANCE). */
const MELODI = 'https://api.insee.fr/melodi/data';

function melodi(dataset: string, geo: string): string {
  return `${MELODI}/${dataset}?GEO=${geo}&maxResult=10000`;
}

/**
 * Indicateurs d'âge (population totale, moins de 20 ans, 65 ans et +) des 272 communes d'Indre-et-Loire,
 * en un seul appel : un paramètre GEO=COM-xxxxx par commune, lus dans la liste API Géo déjà téléchargée.
 * 272 communes × 3 âges × 3 recensements ≈ 2 500 lignes (sous la limite de 10 000).
 */
async function melodiCommunes37(): Promise<string> {
  const communes = JSON.parse(await readFile('data/raw/communes_37.json', 'utf8')) as { code: string }[];
  const geo = communes.map((c) => `GEO=COM-${c.code}`).join('&');
  return `${MELODI}/DS_RP_POPULATION_PRINC?${geo}&SEX=_T&AGE=_T&AGE=Y_LT20&AGE=Y_GE65&maxResult=10000`;
}

const GEORISQUES = 'https://georisques.gouv.fr/api/v1';
/** API tabulaire data.gouv sur la base Mérimée (monuments historiques), filtrable sans télécharger les 100 Mo. */
const MERIMEE = 'https://tabular-api.data.gouv.fr/api/resources/3a52af4a-f9da-4dcc-8110-b07774dfb3bc/data/';
const MERIMEE_COLONNES = [
  'Reference',
  'Titre_editorial_de_la_notice',
  'Denomination_de_l_edifice',
  'Typologie_de_la_protection',
  'Date_et_typologie_de_la_protection',
  'Format_abrege_du_siecle_de_construction',
  'Statut_juridique_de_l_edifice',
  'coordonnees_au_format_WGS84',
].join(',');

/** Géorisques accepte au plus 20 codes INSEE par requête. */
const GEORISQUES_MAX_CODES = 20;

/**
 * Requêtes Géorisques couvrant les 272 communes du département (pour les classements) :
 * les codes INSEE (lus dans la liste API Géo) sont envoyés par paquets de 20.
 */
function georisquesCommunes37(endpoint: string): () => Promise<string[]> {
  return async () => {
    const communes = JSON.parse(await readFile('data/raw/communes_37.json', 'utf8')) as { code: string }[];
    const urls: string[] = [];
    for (let i = 0; i < communes.length; i += GEORISQUES_MAX_CODES) {
      const codes = communes.slice(i, i + GEORISQUES_MAX_CODES).map((c) => c.code);
      urls.push(`${GEORISQUES}/${endpoint}?code_insee=${codes.join(',')}&page_size=1000`);
    }
    return urls;
  };
}

export const SOURCES: readonly Source[] = [
  // — Commune et classement dans le département (accueil, Territoire, Population) —
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

  {
    id: 'ages_communes_37',
    description: "Population et âges des 272 communes d'Indre-et-Loire, 2012-2017-2023 (INSEE, recensement)",
    url: melodiCommunes37,
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

  // — Patrimoine & risques —
  {
    id: 'commune_contour',
    description: 'Contour de la commune, pour les cartes (API Géo / IGN)',
    url: `${GEO_API}/communes/37139?fields=nom&format=geojson&geometry=contour`,
  },
  {
    id: 'monuments_luynes',
    description: 'Monuments historiques de Luynes (Ministère de la Culture, base Mérimée)',
    url: `${MERIMEE}?COG_Insee_lors_de_la_protection__exact=37139&columns=${MERIMEE_COLONNES}&page_size=50`,
    pagination: 'tabular',
  },
  {
    id: 'monuments_37',
    description: "Nombre de monuments historiques par commune d'Indre-et-Loire (base Mérimée)",
    url: `${MERIMEE}?Departement_format_numerique__exact=37&COG_Insee_lors_de_la_protection__groupby&Reference__count&page_size=50`,
    pagination: 'tabular',
  },
  {
    id: 'cavites_luynes',
    description: 'Cavités souterraines recensées à Luynes (Géorisques / BRGM)',
    url: `${GEORISQUES}/cavites?code_insee=37139&page_size=1000`,
    pagination: 'georisques',
  },
  {
    id: 'mouvements_terrain_luynes',
    description: 'Mouvements de terrain recensés à Luynes (Géorisques / BRGM)',
    url: `${GEORISQUES}/mvt?code_insee=37139&page_size=1000`,
    pagination: 'georisques',
  },
  {
    id: 'catnat_luynes',
    description: 'Arrêtés de catastrophe naturelle à Luynes (Géorisques, base GASPAR)',
    url: `${GEORISQUES}/gaspar/catnat?code_insee=37139&page_size=1000`,
    pagination: 'georisques',
  },
  {
    id: 'risques_luynes',
    description: 'Risques naturels recensés à Luynes (Géorisques, base GASPAR)',
    url: `${GEORISQUES}/gaspar/risques?code_insee=37139`,
    pagination: 'georisques',
  },
  {
    id: 'catnat_37',
    description: "Arrêtés de catastrophe naturelle des communes d'Indre-et-Loire (Géorisques)",
    url: georisquesCommunes37('gaspar/catnat'),
    pagination: 'georisques',
  },
  {
    id: 'cavites_37',
    description: "Cavités souterraines des communes d'Indre-et-Loire (Géorisques / BRGM)",
    url: georisquesCommunes37('cavites'),
    pagination: 'georisques',
  },
];
