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

export const CREDITS_ACCUEIL: readonly FooterSource[] = [API_GEO, INSEE_RECENSEMENT, TOURS_METROPOLE];
export const CREDITS_TERRITOIRE: readonly FooterSource[] = [API_GEO];
export const CREDITS_POPULATION: readonly FooterSource[] = [TOURS_METROPOLE, INSEE_RECENSEMENT, API_GEO];
