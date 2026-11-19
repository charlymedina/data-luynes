/**
 * Sources du thème « Élections » (sans clé, Licence Ouverte 2.0) :
 *  - l'historique 1999 → dernier scrutin (participation, voix) vient du fichier national agrégé par bureau de vote,
 *    archivé par scripts/archive-elections.ts (data/archive/elections/) : il n'apparaît donc pas dans cette liste ;
 *  - les municipales 2026 sont lues en plus dans les fichiers officiels du ministère de l'Intérieur
 *    (via l'API tabulaire de data.gouv), qui donnent aussi les sièges obtenus par chaque liste.
 */
import type { Source } from './sources.ts';

const TABULAR = 'https://tabular-api.data.gouv.fr/api/resources';
/** Fichiers « Résultats - Communes » des municipales 2026, 1er et 2nd tours (ministère de l'Intérieur). */
const MUNICIPALES_2026 = {
  t1: `${TABULAR}/4feeef01-24f7-4d5a-914f-8aa806f31ec2/data/`,
  t2: `${TABULAR}/6ff67a28-01bf-459e-beca-dd7aa8132dc1/data/`,
} as const;
const FILTRE_LUYNES = '?Code%20commune__exact=37139';

export const SOURCES_ELECTIONS: readonly Source[] = [
  {
    id: 'municipales_2026_t1',
    description: 'Municipales 2026, 1er tour : résultats de Luynes (ministère de l’Intérieur)',
    url: `${MUNICIPALES_2026.t1}${FILTRE_LUYNES}`,
    pagination: 'tabular',
  },
  {
    id: 'municipales_2026_t2',
    description: 'Municipales 2026, 2nd tour : résultats et sièges de Luynes (ministère de l’Intérieur)',
    url: `${MUNICIPALES_2026.t2}${FILTRE_LUYNES}`,
    pagination: 'tabular',
  },
];
