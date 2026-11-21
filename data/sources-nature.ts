/**
 * Sources du thème « Nature & paysages » (sans clé). Toutes sont filtrées à la source : seules les données autour de
 * Luynes sont téléchargées (≈ 4 Mo au total, quelques secondes). Le découpage exact à la limite de la commune est fait
 * ensuite en SQL (DuckDB spatial) : les rectangles ci-dessous ne servent qu'à ne pas télécharger toute la France.
 *  - Espaces protégés ou inventoriés (ZNIEFF, Natura 2000) : API Carto « nature » de l'IGN (données INPN / MNHN), Licence Ouverte.
 *  - Cultures déclarées : registre parcellaire graphique (RPG), Géoplateforme de l'IGN, Licence Ouverte.
 *  - Vignobles : délimitation parcellaire des AOC viticoles (INAO), diffusée par la Géoplateforme de l'IGN, Licence Ouverte.
 *  - Biodiversité observée : API GBIF (comptages seulement, aucune donnée individuelle n'est conservée).
 */
import { readFile } from 'node:fs/promises';
import type { Source } from './sources.ts';

/** Rectangle englobant Luynes (latitudes 47,36–47,46, longitudes 0,47–0,61), comme pour les zones inondables. */
const BBOX_WFS = 'bbox=47.36,0.47,47.46,0.61,urn:ogc:def:crs:EPSG::4326';
const RECTANGLE_GEOJSON = JSON.stringify({
  type: 'Polygon',
  coordinates: [[[0.47, 47.36], [0.61, 47.36], [0.61, 47.46], [0.47, 47.46], [0.47, 47.36]]],
});

const GEOPF_WFS = 'https://data.geopf.fr/wfs/ows?service=WFS&version=2.0.0';
const APICARTO_NATURE = 'https://apicarto.ign.fr/api/nature';
const GBIF = 'https://api.gbif.org/v1/occurrence/search';

/** Aires protégées ou inventoriées qui touchent le rectangle (API Carto IGN, module « nature »). */
function apicartoNature(couche: string): string {
  return `${APICARTO_NATURE}/${couche}?geom=${encodeURIComponent(RECTANGLE_GEOJSON)}`;
}

function parcellesRpg(couche: string): string {
  return `${GEOPF_WFS}&request=GetFeature&typeNames=RPG.${couche}:parcelles_graphiques&outputFormat=application/json&srsName=EPSG:4326&${BBOX_WFS}`;
}

/** Années d'écart entre la dernière année du RPG et l'année de comparaison. */
const ECART_ANNEES_RPG = 5;
const ESSAIS_RPG = 3;

/**
 * Le RPG le plus récent n'est publié que sous le nom « RPG.LATEST » ; son année est lue dans le titre de la couche
 * (« Registre parcellaire graphique (RPG) 2025 : Parcelles graphiques ») du catalogue WFS de la Géoplateforme (≈ 5 Mo, < 1 s).
 * Le serveur répond parfois par une page technique : on réessaie avant d'abandonner.
 */
let derniereAnneeRpg: Promise<number> | undefined;
function anneeRpgRecente(): Promise<number> {
  derniereAnneeRpg ??= (async () => {
    for (let essai = 1; essai <= ESSAIS_RPG; essai++) {
      try {
        const response = await fetch(`${GEOPF_WFS}&request=GetCapabilities`, { signal: AbortSignal.timeout(120_000) });
        const annee = /RPG\.LATEST:parcelles_graphiques<\/Name><Title>[^<]*?\(RPG\) (\d{4})/.exec(await response.text())?.[1];
        if (annee) return Number(annee);
      } catch {
        // panne passagère : nouvel essai
      }
      await new Promise((resolve) => setTimeout(resolve, 2_000 * essai));
    }
    throw new Error('année du RPG introuvable dans le catalogue de la Géoplateforme');
  })();
  return derniereAnneeRpg;
}

/**
 * Polygone de la commune pour GBIF : l'API n'accepte qu'une adresse de ~4 000 caractères au plus, le contour est donc
 * simplifié à ≈ 20 m près (DuckDB, simplification qui garde une forme valide) ; orienté à l'inverse du GeoJSON,
 * comme l'exige GBIF. Les comptages GBIF sont donc au contour à ~20 m près (les autres couches : contour exact).
 */
const TOLERANCE_CONTOUR_GBIF_DEGRES = 0.0002;
let polygoneGbif: Promise<string> | undefined;
function contourPourGbif(): Promise<string> {
  polygoneGbif ??= (async () => {
    const { DuckDBInstance } = await import('@duckdb/node-api');
    const geometrie = JSON.stringify(JSON.parse(await readFile('data/raw/commune_contour.json', 'utf8')).geometry);
    const instance = await DuckDBInstance.create(':memory:');
    const connexion = await instance.connect();
    try {
      await connexion.run('INSTALL spatial; LOAD spatial;');
      const lignes = (
        await connexion.runAndReadAll(
          `SELECT ST_AsText(ST_Reverse(ST_ReducePrecision(ST_SimplifyPreserveTopology(ST_GeomFromGeoJSON(?), ${TOLERANCE_CONTOUR_GBIF_DEGRES}), 0.00001))) AS wkt`,
          [geometrie],
        )
      ).getRowObjectsJson();
      return String(lignes[0]?.wkt).replace('POLYGON ((', 'POLYGON((').replaceAll(', ', ',');
    } finally {
      connexion.closeSync();
      instance.closeSync();
    }
  })();
  return polygoneGbif;
}

/** Recherche GBIF dans le contour de Luynes : `facettes` = champs dont on veut les comptages, `filtres` = critères en plus. */
function gbif(facettes: readonly string[], limite: number, filtres = ''): () => Promise<string> {
  return async () => {
    const wkt = encodeURIComponent(await contourPourGbif());
    const facets = facettes.map((f) => `facet=${f}`).join('&');
    return `${GBIF}?geometry=${wkt}&limit=0&${facets}&facetLimit=${limite}${filtres}`;
  };
}

/** Espèces classées vulnérables, en danger ou en danger critique sur la liste rouge mondiale de l'UICN. */
const FILTRE_MENACEES = '&iucnRedListCategory=VU&iucnRedListCategory=EN&iucnRedListCategory=CR';
/** Plafond de la liste des espèces (facette GBIF) : très au-dessus du nombre d'espèces observées à Luynes. */
const MAX_ESPECES = 20000;

export const SOURCES_NATURE: readonly Source[] = [
  // — Espaces protégés ou inventoriés —
  { id: 'nature_znieff1', description: 'ZNIEFF de type I autour de Luynes (INPN / MNHN, via API Carto IGN)', url: apicartoNature('znieff1') },
  { id: 'nature_znieff2', description: 'ZNIEFF de type II autour de Luynes (INPN / MNHN, via API Carto IGN)', url: apicartoNature('znieff2') },
  { id: 'nature_natura_habitats', description: 'Natura 2000, zones spéciales de conservation (directive Habitats) autour de Luynes (INPN / MNHN)', url: apicartoNature('natura-habitat') },
  { id: 'nature_natura_oiseaux', description: 'Natura 2000, zones de protection spéciale (directive Oiseaux) autour de Luynes (INPN / MNHN)', url: apicartoNature('natura-oiseaux') },

  // — Cultures et vignobles —
  {
    id: 'nature_rpg_annee',
    description: 'Dernière année publiée du registre parcellaire graphique (RPG)',
    url: async () => `data:application/json,${JSON.stringify({ annee: await anneeRpgRecente(), annee_ancienne: (await anneeRpgRecente()) - ECART_ANNEES_RPG })}`,
  },
  { id: 'nature_rpg', description: 'Parcelles agricoles déclarées autour de Luynes, dernière année (RPG, IGN)', url: async () => parcellesRpg('LATEST') },
  {
    id: 'nature_rpg_ancien',
    description: 'Parcelles agricoles déclarées autour de Luynes, quelques années plus tôt, pour l’évolution (RPG, IGN)',
    url: async () => parcellesRpg(String((await anneeRpgRecente()) - ECART_ANNEES_RPG)),
  },
  {
    id: 'nature_rpg_cultures',
    description: 'Libellés des cultures et groupes de cultures du RPG (IGN)',
    url: `${GEOPF_WFS}&request=GetFeature&typeNames=RPG.LATEST:codes_cultures&outputFormat=application/json`,
  },
  {
    id: 'nature_aoc_viticoles',
    description: 'Délimitation parcellaire des AOC viticoles autour de Luynes (INAO, via Géoplateforme IGN)',
    url: `${GEOPF_WFS}&request=GetFeature&typeNames=AOC-VITICOLES:aire_parcellaire&outputFormat=application/json&srsName=EPSG:4326&${BBOX_WFS}`,
  },

  // — Biodiversité observée (comptages GBIF dans le contour de Luynes) —
  {
    id: 'nature_gbif_resume',
    description: 'Observations GBIF à Luynes : règnes, classes, nature des observations, statut UICN',
    url: gbif(['kingdomKey', 'classKey', 'basisOfRecord', 'iucnRedListCategory'], 60),
  },
  { id: 'nature_gbif_especes', description: 'Espèces observées à Luynes (GBIF), avec nombre d’observations', url: gbif(['speciesKey'], MAX_ESPECES) },
  { id: 'nature_gbif_top', description: 'Espèces les plus observées à Luynes (GBIF)', url: gbif(['scientificName'], 25, '&taxonRank=SPECIES') },
  {
    id: 'nature_gbif_menacees',
    description: 'Espèces menacées (liste rouge mondiale UICN : VU, EN, CR) observées à Luynes (GBIF)',
    url: gbif(['scientificName'], 40, FILTRE_MENACEES),
  },
];
