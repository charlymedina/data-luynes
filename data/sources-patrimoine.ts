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
];
