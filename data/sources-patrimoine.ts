/**
 * Source des « Trésors du patrimoine » (sans clé, Licence Ouverte 2.0) :
 * base Palissy (objets mobiliers protégés au titre des monuments historiques), ministère de la Culture (POP).
 * Le fichier national fait ≈ 365 Mo (séparateur « | ») : DuckDB le lit en continu et ne garde que les objets de Luynes
 * (code INSEE 37139, en commune actuelle ou lors de la protection).
 */
import type { Source } from './sources.ts';

/**
 * Plan de prévention du risque d'inondation (PPRi) de la Loire, Val de Tours – Val de Luynes (DDT d'Indre-et-Loire,
 * data.gouv.fr jeu 67373fda79c29a6c22c40a92). Couche « zone réglementée » du service WFS du Géocatalogue (Géo-IDE),
 * en GML (c'est le seul format que ce service sait produire) dans un rectangle englobant Luynes ; le découpage exact
 * à la limite communale est fait en SQL (data/sql/risques_ppri.sql). L'extension « .gml » du nom de fichier demande
 * à build-data.ts de retirer l'adresse du schéma distant, que GDAL (DuckDB) irait sinon chercher sur Internet.
 */
const PPRI_WFS =
  'https://ogc.geo-ide.developpement-durable.gouv.fr/wxs?map=/opt/data/stack/mapfiles/1.4/org_38016/' +
  'fr-120066022-orphan-59e34478-8fff-4fff-ade9-6c0966b17e63.internet.map&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature' +
  '&typeNames=ms:N_ZONE_REG_PPRN_20120007_S_037&srsName=EPSG:4326&bbox=47.36,0.47,47.46,0.61,urn:ogc:def:crs:EPSG::4326';

export const SOURCES_PATRIMOINE: readonly Source[] = [
  {
    id: 'palissy_luynes',
    description: 'Objets mobiliers protégés (monuments historiques) conservés à Luynes — base Palissy, POP / ministère de la Culture',
    url: 'https://ministere-culture.s3.sbg.io.cloud.ovh.net/POP/palissy.csv',
    format: 'csv-extrait',
    separateur: '|',
    // On filtre sur COG_Insee (commune d'origine de la notice) et PAS sur Code_INSEE_commune_actuelle :
    // ce second champ est erroné pour 2 notices du château de Condé-en-Brie (Aisne, 02209), qui y portent 37139.
    filtre: `COG_Insee = '37139'`,
  },
  {
    id: 'bdtopo_batiments',
    description: 'Bâtiments autour de Luynes : usage, date d’apparition, hauteur (BD TOPO, IGN, via Géoplateforme)',
    // Tri par identifiant (obligatoire pour que les pages se suivent sans trou ni doublon) et seulement les colonnes utiles.
    // Rectangle englobant la commune (découpé au contour exact en SQL) : ≈ 9 400 bâtiments, ≈ 6 Mo, moins de 5 secondes.
    url: 'https://data.geopf.fr/wfs/ows?service=WFS&version=2.0.0&request=GetFeature&typeNames=BDTOPO_V3:batiment&outputFormat=application/json&srsName=EPSG:4326&bbox=47.36,0.485,47.46,0.587,urn:ogc:def:crs:EPSG::4326&sortBy=cleabs&count=5000&startIndex=0&propertyName=cleabs,usage_1,usage_2,nature,etat_de_l_objet,date_d_apparition,date_de_confirmation,hauteur,nombre_de_logements,nombre_d_etages,geometrie',
    pagination: 'wfs',
    // La BD TOPO est mise à jour par l'IGN chaque trimestre : inutile de la retélécharger toutes les semaines.
    validiteJours: 30,
  },
  {
    id: 'ppri_zones',
    description: 'PPRi de la Loire (Val de Tours – Val de Luynes) : zonage réglementaire autour de Luynes (DDT 37, data.gouv.fr)',
    url: PPRI_WFS,
    format: 'fichiers',
    nomFichier: 'zones.gml',
    // Un plan approuvé change très rarement : une vérification mensuelle suffit.
    validiteJours: 30,
  },
];
