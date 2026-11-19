/**
 * Sources du thème « Énergie & mobilité » (toutes sans clé, données de la commune de Luynes uniquement) :
 *  - Agence ORE : consommation annuelle d'électricité et de gaz par commune et par secteur (2011 → dernière année) ;
 *  - ODRÉ (registre national des installations de production) : panneaux solaires raccordés ;
 *  - SDES (ministère de la Transition écologique, plateforme DiDo) : parc de véhicules au 1er janvier, par carburant
 *    et vignette Crit'Air (2011 → dernière année) ;
 *  - Base nationale des bornes de recharge (IRVE, data.gouv) : points de charge, filtrés par position (le code commune
 *    est souvent vide dans cette base), puis par le contour de Luynes dans le SQL.
 */
import { readFile } from 'node:fs/promises';
import type { Source } from './sources.ts';

const ORE = 'https://opendata.agenceore.fr/data-fair/api/v1/datasets/consommation-annuelle-d-electricite-et-gaz-par-commune/lines';
const ODRE = 'https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/registre-national-installation-production-stockage-electricite-agrege/exports/json';
const PARC = 'https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/1582861b-e042-4490-9161-6429d8229703/json';
const IRVE = 'https://tabular-api.data.gouv.fr/api/resources/eb76d20a-8501-400e-b336-d85724de5435/data/';

const q = (expression: string): string => encodeURIComponent(expression);

/** Dernière année présente dans le fichier ORE de Luynes (déjà téléchargé) : sert à filtrer le département. */
async function derniereAnneeOre(): Promise<string> {
  const { results } = JSON.parse(await readFile('data/raw/energie_ore_luynes.json', 'utf8')) as { results: { annee: string }[] };
  const annees = results.map((r) => Number(r.annee)).filter(Number.isFinite);
  if (annees.length === 0) throw new Error('Aucune année dans energie_ore_luynes.json');
  return String(Math.max(...annees));
}

/** Colonnes PARC_<année> présentes dans le fichier du parc de Luynes : première, milieu et dernière années. */
async function anneesParc(): Promise<number[]> {
  const lignes = JSON.parse(await readFile('data/raw/parc_vehicules_luynes.json', 'utf8')) as Record<string, unknown>[];
  const annees = Object.keys(lignes[0] ?? {})
    .map((cle) => /^PARC_(\d{4})$/.exec(cle)?.[1])
    .filter((a): a is string => a !== undefined)
    .map(Number)
    .sort((a, b) => a - b);
  const derniere = annees.at(-1);
  if (derniere === undefined) throw new Error('Aucune colonne PARC_<année> dans parc_vehicules_luynes.json');
  return [...new Set([derniere - 10, derniere - 5, derniere])].filter((a) => annees.includes(a));
}

export const SOURCES_ENERGIE: readonly Source[] = [
  {
    id: 'energie_ore_luynes',
    description: "Consommation d'électricité et de gaz à Luynes par secteur, chaque année (Agence ORE)",
    url: `${ORE}?qs=${q('code_commune:37139')}&size=1000`,
  },
  {
    id: 'energie_ore_37',
    description: "Consommation d'électricité et de gaz par commune d'Indre-et-Loire, dernière année (Agence ORE)",
    url: async () =>
      `${ORE}?qs=${q(`code_departement:37 AND annee:${await derniereAnneeOre()}`)}&size=10000` +
      '&select=code_commune,filiere,code_grand_secteur,conso_totale_mwh,nb_sites,nombre_de_mailles_secretisees',
  },
  {
    id: 'solaire_luynes',
    description: 'Installations de production électrique raccordées à Luynes (ODRÉ, registre national)',
    url: `${ODRE}?where=${q('codeinseecommune="37139"')}&select=${q('nominstallation,filiere,codefiliere,puismaxinstallee,nbinstallations,datemiseenservice')}`,
  },
  {
    id: 'solaire_communes_37',
    description: "Puissance solaire installée par commune d'Indre-et-Loire (ODRÉ, registre national)",
    url:
      `${ODRE}?where=${q('codedepartement="37" and codefiliere="SOLAI"')}&group_by=codeinseecommune` +
      `&select=${q('codeinseecommune,sum(puismaxinstallee) as puissance_kw,sum(nbinstallations) as installations')}`,
  },
  {
    id: 'parc_vehicules_luynes',
    description: "Véhicules immatriculés à Luynes au 1er janvier, par carburant et Crit'Air, depuis 2011 (SDES)",
    url: `${PARC}?COMMUNE_CODE=eq:37139`,
  },
  {
    id: 'parc_vp_37',
    description: "Voitures particulières par commune d'Indre-et-Loire, carburant et Crit'Air, 3 années (SDES)",
    url: async () => `${PARC}?COMMUNE_CODE=startsWith:37&GROUPE=eq:VP&columns=COMMUNE_CODE,CARBURANT,CRIT_AIR,${(await anneesParc()).map((a) => `PARC_${a}`).join(',')}`,
  },
  {
    id: 'bornes_recharge',
    description: 'Points de recharge pour véhicules électriques autour de Luynes (base nationale IRVE, data.gouv)',
    url:
      `${IRVE}?consolidated_latitude__greater=47.35&consolidated_latitude__less=47.45` +
      '&consolidated_longitude__greater=0.45&consolidated_longitude__less=0.63&page_size=50',
    pagination: 'tabular',
  },
];
