/**
 * Sources du thème « Sport » (sans clé, Licence Ouverte) :
 *  - licences sportives par commune de résidence et par fédération (INJEP / ministère des Sports, data.gouv.fr) :
 *    un gros CSV national par année (≈ 250 Mo), lu en continu : seules les lignes d'Indre-et-Loire sont gardées ;
 *  - recensement des équipements sportifs (RES, « Data ES », ministère des Sports) : Luynes, puis le département
 *    (quelques colonnes seulement) pour comparer.
 * Le code postal 37230 est partagé avec Fondettes : on filtre toujours sur le code INSEE (37139 / « new_code »).
 */
import type { Source } from './sources.ts';

const DATASET_LICENCES =
  'https://www.data.gouv.fr/api/1/datasets/donnees-geocodees-issues-du-recensement-des-licences-et-clubs-aupres-des-federations-sportives-agreees-par-le-ministere-charge-des-sports/';
/** Nombre d'années de licences lues : la dernière publiée et les précédentes (pour l'évolution). */
const ANNEES_LICENCES = 4;

/** Adresses des fichiers « lic-data-AAAA.csv » les plus récents, trouvées dans la fiche data.gouv du jeu. */
async function fichiersLicences(): Promise<string[]> {
  const response = await fetch(DATASET_LICENCES, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`fiche data.gouv des licences : HTTP ${response.status}`);
  const { resources } = (await response.json()) as { resources: { title: string; url: string }[] };
  const fichiers = resources
    .map((r) => ({ annee: Number(/^lic-data-(\d{4})\.csv$/.exec(r.title)?.[1] ?? 0), url: r.url }))
    .filter((f) => f.annee > 0)
    .sort((a, b) => b.annee - a.annee)
    .slice(0, ANNEES_LICENCES);
  if (fichiers.length === 0) throw new Error('aucun fichier lic-data-AAAA.csv trouvé dans la fiche data.gouv');
  return fichiers.map((f) => f.url);
}

const RES = 'https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/exports/csv';
const COLONNES_DEPARTEMENT = ['equip_numero', 'new_code', 'inst_numero', 'equip_type_famille', 'equip_service_date', 'equip_service_periode'].join(',');

export const SOURCES_SPORT: readonly Source[] = [
  {
    id: 'sport_licences_37',
    description: "Licences sportives par commune de résidence et fédération, Indre-et-Loire, dernières années (INJEP / ministère des Sports)",
    url: fichiersLicences,
    format: 'csv-extrait',
    filtre: `"Code Commune" LIKE '37%'`,
  },
  {
    id: 'sport_equipements_luynes',
    description: 'Équipements sportifs de Luynes : type, mise en service, position, accessibilité (RES / Data ES)',
    url: `${RES}?where=${encodeURIComponent('new_code="37139"')}`,
    format: 'fichiers',
  },
  {
    id: 'sport_equipements_37',
    description: "Équipements sportifs d'Indre-et-Loire, par commune (RES / Data ES), pour comparer",
    url: `${RES}?where=${encodeURIComponent('dep_code="37"')}&select=${COLONNES_DEPARTEMENT}`,
    format: 'fichiers',
  },
];
