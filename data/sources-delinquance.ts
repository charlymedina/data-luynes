/**
 * Sources du thème « Délinquance » (sans clé, Licence Ouverte 2.0) : bases communale et départementale de la
 * délinquance enregistrée par la police et la gendarmerie (SSMSI, service statistique du ministère de l'Intérieur).
 * Leurs adresses changent à chaque publication (chaque été) : elles sont retrouvées via l'API data.gouv.
 */
import type { Source } from './sources.ts';

/** Jeu « Bases statistiques communale, départementale et régionale de la délinquance enregistrée » (SSMSI). */
const SSMSI = 'https://www.data.gouv.fr/api/1/datasets/621df2954fa5a3b5a023e23c/';

interface Ressource {
  title: string;
  url: string;
}

/** Adresse de la ressource SSMSI dont le titre commence par `prefixe` et l'adresse finit par `extension`. */
function ressourceSsmsi(prefixe: string, extension: string): () => Promise<string> {
  return async () => {
    const response = await fetch(SSMSI, { signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new Error(`API data.gouv : HTTP ${response.status}`);
    const { resources } = (await response.json()) as { resources: Ressource[] };
    const trouvee = resources.find((r) => r.title.startsWith(prefixe) && r.url.endsWith(extension));
    if (!trouvee) throw new Error(`ressource SSMSI « ${prefixe}… ${extension} » introuvable`);
    return trouvee.url;
  };
}

export const SOURCES_DELINQUANCE: readonly Source[] = [
  {
    id: 'delinquance_communes',
    description: 'Délinquance enregistrée par commune, 2016 → dernière année (SSMSI, fichier Parquet)',
    url: ressourceSsmsi('COM - ', '.parquet'),
    format: 'fichiers',
  },
  {
    id: 'delinquance_departements',
    description: 'Délinquance enregistrée par département, 2016 → dernière année (SSMSI)',
    url: ressourceSsmsi('DEP - ', '.csv'),
    format: 'fichiers',
  },
];
