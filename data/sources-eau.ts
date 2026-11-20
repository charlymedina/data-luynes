/**
 * Sources du thème « Eau potable » (sans clé, Licence Ouverte 2.0) : contrôle sanitaire de l'eau distribuée,
 * API Hub'eau « qualité de l'eau potable » (données des Agences régionales de santé, ministère de la Santé).
 * Luynes est desservie par le réseau « FONDETTES (LUYNES) » : les résultats sont ceux rattachés à la commune 37139.
 * Hub'eau n'accepte pas plus de 20 000 résultats par requête : les données du département sont limitées aux
 * années récentes (FENETRE_ANNEES) et à quelques paramètres.
 */
import type { Source } from './sources.ts';

const HUBEAU = 'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis';
const TAILLE_PAGE = 5000;
/** Comparaison départementale : années complètes récentes (+ l'année en cours). */
const FENETRE_ANNEES = 3;

const CHAMPS_LUYNES = [
  'code_prelevement',
  'date_prelevement',
  'code_parametre',
  'libelle_parametre',
  'resultat_numerique',
  'libelle_unite',
  'conformite_limites_bact_prelevement',
  'conformite_limites_pc_prelevement',
  'conformite_references_bact_prelevement',
  'conformite_references_pc_prelevement',
  'nom_distributeur',
].join(',');

const CHAMPS_DEPARTEMENT = ['code_prelevement', 'code_commune', 'date_prelevement', 'resultat_numerique', 'conformite_limites_bact_prelevement'].join(',');

/** 1er janvier de l'année « en cours − FENETRE_ANNEES » (ex. 2023-01-01 en 2026). */
function debutFenetre(): string {
  return `${new Date().getFullYear() - FENETRE_ANNEES}-01-01`;
}

function departement(codeParametre: string): () => Promise<string> {
  return async () =>
    `${HUBEAU}?code_departement=37&code_parametre=${codeParametre}&date_min_prelevement=${debutFenetre()}&size=${TAILLE_PAGE}&fields=${CHAMPS_DEPARTEMENT}`;
}

export const SOURCES_EAU: readonly Source[] = [
  {
    id: 'eau_luynes',
    description: "Analyses de l'eau du robinet à Luynes, 2016 → aujourd'hui (Hub'eau, contrôle sanitaire des ARS)",
    url: `${HUBEAU}?code_commune=37139&size=${TAILLE_PAGE}&fields=${CHAMPS_LUYNES}`,
    pagination: 'hubeau',
  },
  {
    id: 'eau_37_nitrates',
    description: "Nitrates dans l'eau du robinet en Indre-et-Loire, années récentes (Hub'eau)",
    url: departement('1340'),
    pagination: 'hubeau',
  },
  {
    id: 'eau_37_durete',
    description: "Dureté (calcaire) de l'eau du robinet en Indre-et-Loire, années récentes (Hub'eau)",
    url: departement('1345'),
    pagination: 'hubeau',
  },
  {
    id: 'eau_37_bacterio',
    description: "Contrôles bactériologiques (E. coli) de l'eau du robinet en Indre-et-Loire, années récentes (Hub'eau)",
    url: departement('1449'),
    pagination: 'hubeau',
  },
];
