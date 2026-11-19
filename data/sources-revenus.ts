/**
 * Sources du thème « Revenus & emploi » : API Melodi de l'INSEE (sans clé).
 * Un appel peut porter sur plusieurs territoires (un paramètre GEO par territoire) et filtrer les dimensions
 * (ex. AGE=Y15T64) pour rester petit. Codes : COM-37139 = Luynes, DEP-37 = Indre-et-Loire, FRANCE = France.
 */
import { readFile } from 'node:fs/promises';
import type { Source } from './sources.ts';

const MELODI = 'https://api.insee.fr/melodi/data';
const TROIS_TERRITOIRES = 'GEO=COM-37139&GEO=DEP-37&GEO=FRANCE';

/** Paramètres GEO=COM-xxxxx des 272 communes du département (liste API Géo déjà téléchargée). */
async function geoCommunes37(): Promise<string> {
  const communes = JSON.parse(await readFile('data/raw/communes_37.json', 'utf8')) as { code: string }[];
  return communes.map((c) => `GEO=COM-${c.code}`).join('&');
}

export const SOURCES_REVENUS: readonly Source[] = [
  {
    id: 'filosofi',
    description: 'Niveau de vie médian et taux de pauvreté — Luynes, Indre-et-Loire, France (INSEE, Filosofi)',
    url: `${MELODI}/DS_FILOSOFI_CC?${TROIS_TERRITOIRES}&FILOSOFI_MEASURE=MED_SL&FILOSOFI_MEASURE=PR_MD60&maxResult=1000`,
  },
  {
    id: 'filosofi_communes_37',
    description: "Niveau de vie médian des communes d'Indre-et-Loire (INSEE, Filosofi)",
    url: async () => `${MELODI}/DS_FILOSOFI_CC?${await geoCommunes37()}&FILOSOFI_MEASURE=MED_SL&maxResult=10000`,
  },
  {
    id: 'activite',
    description: 'Situation des 15-64 ans (emploi, chômage, études, retraite) — Luynes, Indre-et-Loire, France (INSEE, recensement)',
    url: `${MELODI}/DS_RP_EMPLOI_LR_PRINC?${TROIS_TERRITOIRES}&AGE=Y15T64&SEX=_T&EDUC=_T&maxResult=10000`,
  },
  {
    id: 'chomage_communes_37',
    description: "Actifs et chômeurs de 15-64 ans des communes d'Indre-et-Loire, dernier recensement (INSEE)",
    url: async () =>
      `${MELODI}/DS_RP_EMPLOI_LR_PRINC?${await geoCommunes37()}&AGE=Y15T64&SEX=_T&EDUC=_T&EMPSTA_ENQ=1T2&EMPSTA_ENQ=2&TIME_PERIOD=2023&maxResult=10000`,
  },
  {
    id: 'navettes',
    description: 'Lieu de travail et moyen de transport des actifs en emploi — Luynes, Indre-et-Loire, France (INSEE, recensement)',
    url: `${MELODI}/DS_RP_NAVETTES_PRINC?${TROIS_TERRITOIRES}&maxResult=10000`,
  },
  {
    id: 'salaires',
    description: 'Salaire net mensuel moyen en équivalent temps plein, secteur privé, par sexe (INSEE, base Tous salariés)',
    url: `${MELODI}/DS_BTS_SAL_EQTP_SEX_AGE?${TROIS_TERRITOIRES}&AGE=_T&maxResult=1000`,
  },
  {
    id: 'creations_entreprises',
    description: "Créations d'entreprises à Luynes par année (INSEE, SIDE)",
    url: `${MELODI}/DS_SIDE_CREA_COM?GEO=COM-37139&ACTIVITY=_T&LEGAL_FORM=_T&SIDE_MEASURE=BURE&maxResult=1000`,
  },
];
