/** Sources citées en pied de page, par thème (voir aussi docs/sources.md). */
import type { FooterSource } from '../components/SiteFooter.astro';

const API_GEO: FooterSource = {
  nom: 'API Géo',
  url: 'https://geo.api.gouv.fr',
  detail: 'populations légales INSEE et contours IGN — Licence Ouverte 2.0',
};

const INSEE_RECENSEMENT: FooterSource = {
  nom: 'INSEE — recensement et état civil (API Melodi)',
  url: 'https://www.insee.fr/fr/information/8193036',
  detail: 'population par âge et sexe, naissances, décès — Licence Ouverte 2.0',
};

const TOURS_METROPOLE: FooterSource = {
  nom: 'Tours Métropole Val de Loire — open data',
  url: 'https://data.tours-metropole.fr/explore/dataset/population-1876-2023-tours-metropole-val-de-loire/',
  detail: 'population historique 1876-2023 (source INSEE) — Licence Ouverte 2.0',
};

const MERIMEE: FooterSource = {
  nom: 'Ministère de la Culture — base Mérimée (monuments historiques)',
  url: 'https://www.data.gouv.fr/datasets/5af120e5b595087cfabcde81/',
  detail: 'via l’API tabulaire de data.gouv.fr — Licence Ouverte 2.0',
};

const GEORISQUES: FooterSource = {
  nom: 'Géorisques (ministère de la Transition écologique, BRGM)',
  url: 'https://www.georisques.gouv.fr',
  detail: 'cavités souterraines, mouvements de terrain, arrêtés de catastrophe naturelle (GASPAR) — Licence Ouverte 2.0',
};

const OPENFREEMAP: FooterSource = {
  nom: 'OpenFreeMap',
  url: 'https://openfreemap.org',
  detail: 'fond de carte, données © contributeurs OpenStreetMap (ODbL)',
};

export const CREDITS_ACCUEIL: readonly FooterSource[] = [API_GEO, INSEE_RECENSEMENT, TOURS_METROPOLE, MERIMEE, GEORISQUES];
export const CREDITS_PATRIMOINE: readonly FooterSource[] = [MERIMEE, GEORISQUES, API_GEO, OPENFREEMAP];
export const CREDITS_TERRITOIRE: readonly FooterSource[] = [API_GEO];
export const CREDITS_POPULATION: readonly FooterSource[] = [TOURS_METROPOLE, INSEE_RECENSEMENT, API_GEO];
