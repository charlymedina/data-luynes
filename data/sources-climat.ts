/**
 * Sources du thème « Climat » : données climatologiques quotidiennes de Météo-France (meteo.data.gouv.fr, sans clé).
 * Aucune station à Luynes : on utilise la station de TOURS (aéroport de Parçay-Meslay, n° 37179001, ~15 km),
 * la plus proche avec une longue série. Les fichiers du département sont filtrés en SQL (data/sql/_climat.sql).
 */
import type { Source } from './sources.ts';

/** Jeu « Données climatologiques de base - quotidiennes » de Météo-France sur data.gouv.fr. */
const DATASET = 'https://www.data.gouv.fr/api/1/datasets/6569b51ae64326786e4e8e1a/';

/**
 * Adresses des deux fichiers « pluie, températures, vent » de l'Indre-et-Loire : la longue série (1950 → N-2)
 * et les années récentes (N-1 → hier). Leurs noms changent chaque année : on les relit dans l'API data.gouv.
 */
async function fichiersQuotidiens37(): Promise<string[]> {
  const response = await fetch(DATASET, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`API data.gouv : HTTP ${response.status}`);
  const { resources } = (await response.json()) as { resources: { url: string }[] };
  const urls = resources.map((r) => r.url).filter((url) => /\/Q_37_(previous|latest)-\d{4}-\d{4}_RR-T-Vent\.csv\.gz$/.test(url));
  if (urls.length !== 2) throw new Error(`fichiers Météo-France du 37 introuvables (${urls.length} trouvé(s))`);
  return urls;
}

export const SOURCES_CLIMAT: readonly Source[] = [
  {
    id: 'meteo_37',
    description: "Relevés quotidiens des stations météo d'Indre-et-Loire depuis 1950 (Météo-France)",
    url: fichiersQuotidiens37,
    format: 'fichiers',
  },
];
