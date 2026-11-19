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
  detail: 'cavités souterraines, mouvements de terrain, arrêtés de catastrophe naturelle (GASPAR), zones inondables (directive inondation, TRI de Tours) — Licence Ouverte 2.0',
};

const DVF: FooterSource = {
  nom: 'Demandes de valeurs foncières géolocalisées (DGFiP, Etalab)',
  url: 'https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres-geolocalisees/',
  detail: 'ventes immobilières (années publiées + archive du site) — Licence Ouverte 2.0',
};

const ADEME_DPE: FooterSource = {
  nom: 'ADEME — diagnostics de performance énergétique (DPE)',
  url: 'https://data.ademe.fr/datasets/dpe03existant',
  detail: 'logements existants, DPE depuis juillet 2021 — Licence Ouverte 2.0',
};

const CARTE_LOYERS: FooterSource = {
  nom: 'Carte des loyers 2025 (ministère de la Transition écologique)',
  url: 'https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2025/',
  detail: 'loyers d’annonce charges comprises, par commune — Licence Ouverte 2.0',
};

const DGFIP_COMPTES: FooterSource = {
  nom: 'DGFiP — comptes individuels des communes',
  url: 'https://data.economie.gouv.fr/explore/?q=comptes-individuels-des-communes',
  detail: 'budgets communaux 2000 → dernière année, moyennes de strate — Licence Ouverte 2.0',
};

const INSEE_REVENUS_EMPLOI: FooterSource = {
  nom: 'INSEE — Filosofi, recensement, base Tous salariés, SIDE (API Melodi)',
  url: 'https://www.insee.fr/fr/information/8193036',
  detail: 'niveau de vie, pauvreté, activité, trajets domicile-travail, salaires, créations d’entreprises — Licence Ouverte 2.0',
};

const OPENFREEMAP: FooterSource = {
  nom: 'OpenFreeMap',
  url: 'https://openfreemap.org',
  detail: 'fond de carte, données © contributeurs OpenStreetMap (ODbL)',
};

export const CREDITS_ACCUEIL: readonly FooterSource[] = [API_GEO, INSEE_RECENSEMENT, TOURS_METROPOLE, MERIMEE, GEORISQUES, DVF, DGFIP_COMPTES, INSEE_REVENUS_EMPLOI];
export const CREDITS_BUDGET: readonly FooterSource[] = [DGFIP_COMPTES];
export const CREDITS_REVENUS: readonly FooterSource[] = [INSEE_REVENUS_EMPLOI, API_GEO];
export const CREDITS_IMMOBILIER: readonly FooterSource[] = [DVF, CARTE_LOYERS, ADEME_DPE, API_GEO, OPENFREEMAP];
export const CREDITS_PATRIMOINE: readonly FooterSource[] = [MERIMEE, GEORISQUES, API_GEO, OPENFREEMAP];
export const CREDITS_TERRITOIRE: readonly FooterSource[] = [API_GEO];
export const CREDITS_POPULATION: readonly FooterSource[] = [TOURS_METROPOLE, INSEE_RECENSEMENT, API_GEO];
