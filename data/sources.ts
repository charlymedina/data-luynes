/**
 * Liste des sources de données téléchargées avant chaque construction du site.
 * Chaque source est enregistrée dans data/raw/<id>.json, que les requêtes SQL lisent ensuite.
 * Pense à documenter toute nouvelle source dans docs/sources.md (origine, licence, mise à jour).
 */
import { readFile } from 'node:fs/promises';
import { SOURCES_BUDGET } from './sources-budget.ts';
import { SOURCES_REVENUS } from './sources-revenus.ts';
import { SOURCES_EQUIPEMENTS } from './sources-equipements.ts';
import { SOURCES_ENERGIE } from './sources-energie.ts';
import { SOURCES_ELECTIONS } from './sources-elections.ts';
import { SOURCES_DELINQUANCE } from './sources-delinquance.ts';
import { SOURCES_EAU } from './sources-eau.ts';
import { SOURCES_CONSTRUCTION } from './sources-construction.ts';
import { SOURCES_SPORT } from './sources-sport.ts';
import { SOURCES_RUES } from './sources-rues.ts';
import { SOURCES_PATRIMOINE } from './sources-patrimoine.ts';
import { SOURCES_NATURE } from './sources-nature.ts';
import { SOURCES_QUOTIDIEN } from './sources-quotidien.ts';

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
   *  - « tabular »    : API tabulaire data.gouv (lien links.next) ;
   *  - « hubeau »     : API Hub'eau (lien next) ;
   *  - « dido »       : API DiDo du SDES (lien nextPage, pages de 100 lignes).
   */
  readonly pagination?: 'georisques' | 'tabular' | 'hubeau' | 'dido';
  /**
   * « json » (par défaut) : réponse JSON enregistrée dans data/raw/<id>.json.
   * « fichiers » : fichiers bruts (ex. CSV compressés) enregistrés tels quels dans le dossier data/raw/<id>/.
   * « parquet-extrait » : gros fichier Parquet en ligne dont seules les lignes demandées (filtre) et les colonnes
   * utiles sont lues à distance par DuckDB, puis enregistrées dans data/raw/<id>.parquet.
   * « csv-extrait » : gros CSV (séparateur « ; ») lus en continu, seules les lignes du filtre sont gardées (data/raw/<id>.parquet).
   */
  readonly format?: 'json' | 'fichiers' | 'parquet-extrait' | 'csv-extrait';
  /** Format « parquet-extrait » : condition SQL (WHERE) qui garde les lignes de Luynes. */
  readonly filtre?: string;
  /** Format « csv-extrait » : séparateur de colonnes (« ; » par défaut). */
  readonly separateur?: string;
  /** Format « parquet-extrait » : colonnes à conserver. */
  readonly colonnes?: readonly string[];
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

/**
 * Zones inondables (Géorisques, service WFS « directive inondation ») autour de Luynes, au format GeoJSON.
 * Couche ALEA_SYNT_01_02MOY : débordement de cours d'eau (01), scénario « moyen » (02MOY, crue de référence
 * de probabilité moyenne) du territoire à risque important d'inondation (TRI) de Tours.
 * Le rectangle (latitudes 47,36–47,46, longitudes 0,47–0,61) englobe la commune ; le découpage exact
 * à la limite communale est fait en SQL (data/sql/risques_zones_inondables.sql).
 */
const ZONES_INONDABLES =
  'https://www.georisques.gouv.fr/services?service=WFS&version=2.0.0&request=GetFeature' +
  '&typeNames=ms:ALEA_SYNT_01_02MOY_FXX&srsName=EPSG:4326&outputFormat=geojson' +
  '&bbox=47.36,0.47,47.46,0.61,urn:ogc:def:crs:EPSG::4326';

/** Requête HEAD avec 3 essais : une erreur passagère ne doit pas faire « disparaître » une année. */
async function existe(url: string): Promise<boolean> {
  for (let essai = 1; essai <= 3; essai++) {
    try {
      const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(30_000) });
      if (response.ok) return true;
      if (response.status === 404) return false;
    } catch {
      // panne réseau passagère : nouvel essai
    }
    await new Promise((resolve) => setTimeout(resolve, 3_000 * essai));
  }
  throw new Error(`${url} : pas de réponse claire après 3 essais`);
}

/** Géo-DVF (Etalab) : ventes immobilières géolocalisées, un fichier par année et par département. */
const GEO_DVF = 'https://files.data.gouv.fr/geo-dvf/latest/csv';
/** Nombre d'années à tester en remontant depuis l'année en cours (DVF ne garde que ~5 ans glissants). */
const DVF_ANNEES_TESTEES = 7;

/**
 * Adresses des fichiers DVF d'Indre-et-Loire de toutes les années actuellement publiées.
 * La liste change à chaque mise à jour (une année arrive, la plus ancienne disparaît) :
 * on teste les années récentes une par une et on garde celles qui existent.
 */
async function dvfDepartement37(): Promise<string[]> {
  const anneeEnCours = new Date().getFullYear();
  const annees: number[] = [];
  for (let annee = anneeEnCours - DVF_ANNEES_TESTEES; annee <= anneeEnCours; annee++) {
    if (await existe(`${GEO_DVF}/${annee}/departements/37.csv.gz`)) annees.push(annee);
  }
  // Garde-fou : les années publiées doivent se suivre (un trou = fichier manquant ou panne, pas une vraie absence).
  const premiere = annees[0];
  const derniere = annees.at(-1);
  if (premiere === undefined || derniere === undefined || derniere - premiere + 1 !== annees.length || annees.length < 4) {
    throw new Error(`années DVF publiées incohérentes : ${annees.join(', ') || 'aucune'}`);
  }
  return annees.map((annee) => `${GEO_DVF}/${annee}/departements/37.csv.gz`);
}

/** API « data-fair » de l'ADEME : diagnostics de performance énergétique (DPE) des logements existants. */
const DPE_AGREGATS = 'https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/values_agg?field=etiquette_dpe';

const DATAGOUV = 'https://www.data.gouv.fr/api/1';

interface JeuDataGouv {
  id: string;
  title: string;
  resources: { id: string; title: string }[];
}

/**
 * Carte des loyers (ministère de la Transition écologique) : un nouveau jeu chaque année
 * (« … indicateurs de loyers d'annonce par commune en 2025 »). On cherche le plus récent sur data.gouv.fr
 * à chaque construction, puis on lit ses fichiers via l'API tabulaire (évite l'encodage Latin-1 du CSV).
 */
let jeuLoyers: Promise<JeuDataGouv> | undefined;
function jeuLoyersRecent(): Promise<JeuDataGouv> {
  jeuLoyers ??= (async () => {
    const q = encodeURIComponent('carte des loyers indicateurs de loyers d\'annonce par commune');
    const response = await fetch(`${DATAGOUV}/datasets/?q=${q}&page_size=20`, { signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new Error(`recherche data.gouv : HTTP ${response.status}`);
    const { data } = (await response.json()) as { data: JeuDataGouv[] };
    const annee = (jeu: JeuDataGouv): number => Number(/par commune en (\d{4})/.exec(jeu.title)?.[1] ?? 0);
    const recent = [...data].sort((a, b) => annee(b) - annee(a))[0];
    if (!recent || annee(recent) === 0) throw new Error('jeu « Carte des loyers » introuvable sur data.gouv.fr');
    return recent;
  })();
  return jeuLoyers;
}

/** Adresse tabulaire du fichier « Indicateurs de loyer maison » (ou appartement) du jeu le plus récent. */
function loyersRecents(type: 'maison' | 'appartement'): () => Promise<string> {
  return async () => {
    const jeu = await jeuLoyersRecent();
    const fichier = jeu.resources.find((r) => r.title.trim().toLowerCase() === `indicateurs de loyer ${type}`);
    if (!fichier) throw new Error(`fichier « Indicateurs de loyer ${type} » absent du jeu ${jeu.id}`);
    return `https://tabular-api.data.gouv.fr/api/resources/${fichier.id}/data/?DEP__exact=37&page_size=50`;
  };
}

/**
 * Population historique de Tours Métropole : l'identifiant du jeu contient sa dernière année
 * (« population-1876-2023-… ») ; on cherche le plus récent dans le catalogue à chaque construction.
 */
async function populationHistorique(): Promise<string> {
  const response = await fetch(`${TOURS_METROPOLE}?select=dataset_id&where=search(%22population%201876%22)&limit=20`, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`catalogue Tours Métropole : HTTP ${response.status}`);
  const { results } = (await response.json()) as { results: { dataset_id: string }[] };
  const jeux = results.map((r) => r.dataset_id).filter((id) => /^population-1876-\d{4}-tours-metropole/.test(id)).sort();
  const recent = jeux.at(-1);
  if (!recent) throw new Error('jeu « population 1876-… » introuvable sur le portail de Tours Métropole');
  return `${TOURS_METROPOLE}/${recent}/exports/json?select=annee,population&where=code_geographique%3D%2237139%22&order_by=annee`;
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
    url: populationHistorique,
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
  {
    id: 'zones_inondables',
    description: 'Zones inondables de la Loire autour de Luynes, crue de référence (Géorisques, directive inondation)',
    url: ZONES_INONDABLES,
  },

  // — Immobilier —
  {
    id: 'dvf_37',
    description: "Ventes immobilières d'Indre-et-Loire, toutes les années publiées (DVF géolocalisées, Etalab)",
    url: dvfDepartement37,
    format: 'fichiers',
  },
  {
    id: 'dpe_luynes',
    description: 'Étiquettes énergie (DPE) des logements de Luynes (ADEME)',
    url: `${DPE_AGREGATS}&qs=code_insee_ban:37139`,
  },
  {
    id: 'dpe_37',
    description: "Étiquettes énergie (DPE) des logements d'Indre-et-Loire (ADEME)",
    url: `${DPE_AGREGATS}&qs=code_departement_ban:37`,
  },
  {
    id: 'dpe_france',
    description: 'Étiquettes énergie (DPE) des logements de France (ADEME)',
    url: DPE_AGREGATS,
  },
  {
    id: 'loyers_maisons_37',
    description: "Loyers d'annonce des maisons par commune d'Indre-et-Loire, dernier millésime (Carte des loyers)",
    url: loyersRecents('maison'),
    pagination: 'tabular',
  },
  {
    id: 'loyers_appartements_37',
    description: "Loyers d'annonce des appartements par commune d'Indre-et-Loire, dernier millésime (Carte des loyers)",
    url: loyersRecents('appartement'),
    pagination: 'tabular',
  },
  {
    id: 'loyers_millesime',
    description: 'Fiche du jeu « Carte des loyers » le plus récent (pour lire son année)',
    url: async () => `${DATAGOUV}/datasets/${(await jeuLoyersRecent()).id}/`,
  },

  // — Budget & vie municipale (voir data/sources-budget.ts) —
  ...SOURCES_BUDGET,

  // — Revenus & emploi (voir data/sources-revenus.ts) —
  ...SOURCES_REVENUS,

  // — Écoles, santé & services (voir data/sources-equipements.ts) —
  ...SOURCES_EQUIPEMENTS,

  // — Énergie & mobilité (voir data/sources-energie.ts) —
  ...SOURCES_ENERGIE,

  // — Élections (voir data/sources-elections.ts ; l'historique est archivé par scripts/archive-elections.ts) —
  ...SOURCES_ELECTIONS,

  // — Délinquance (voir data/sources-delinquance.ts) —
  ...SOURCES_DELINQUANCE,

  // — Eau potable (voir data/sources-eau.ts) —
  ...SOURCES_EAU,

  // — Construction et logements sociaux (voir data/sources-construction.ts) —
  ...SOURCES_CONSTRUCTION,

  // — Sport : licences INJEP et équipements RES (voir data/sources-sport.ts) —
  ...SOURCES_SPORT,

  // — Les rues : Base Adresse Nationale (voir data/sources-rues.ts) —
  ...SOURCES_RUES,
  ...SOURCES_PATRIMOINE,

  // — Nature & paysages : espaces protégés, cultures, AOC, biodiversité (voir data/sources-nature.ts) —
  ...SOURCES_NATURE,

  // — Vie quotidienne : fibre, défibrillateurs, covoiturage, mobilier urbain (voir data/sources-quotidien.ts) —
  ...SOURCES_QUOTIDIEN,
];
