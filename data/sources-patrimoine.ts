/**
 * Source des « Trésors du patrimoine » (sans clé, Licence Ouverte 2.0) :
 * base Palissy (objets mobiliers protégés au titre des monuments historiques), ministère de la Culture (POP).
 * Le fichier national fait ≈ 365 Mo (séparateur « | ») : DuckDB le lit en continu et ne garde que les objets de Luynes
 * (code INSEE 37139, en commune actuelle ou lors de la protection).
 */
import type { Source } from './sources.ts';

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
];
