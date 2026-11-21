/**
 * Source du thème « Les rues de Luynes » (sans clé, Licence Ouverte 2.0) :
 *  - Base Adresse Nationale (BAN, IGN / DINUM) : export CSV de tout le département (≈ 10 Mo compressés),
 *    lu en continu par DuckDB ; seules les adresses du code INSEE 37139 sont gardées.
 * Le code postal 37230 est partagé avec Fondettes : on filtre toujours sur le code INSEE.
 */
import type { Source } from './sources.ts';

export const SOURCES_RUES: readonly Source[] = [
  {
    id: 'rues_ban_luynes',
    description: "Adresses de Luynes : nom de voie ou de lieu-dit, numéro, position (Base Adresse Nationale)",
    url: 'https://adresse.data.gouv.fr/data/ban/adresses/latest/csv/adresses-37.csv.gz',
    format: 'csv-extrait',
    filtre: `code_insee = '37139'`,
  },
];
