/**
 * Sources du thème « Vie quotidienne » (sans clé ; Licence Ouverte, sauf le covoiturage en ODbL) :
 *  - ARCEP « Ma connexion internet » : locaux éligibles à chaque technologie, par commune (CSV nationaux de ≈ 2,3 Mo
 *    par trimestre ; seules les lignes d'Indre-et-Loire sont gardées) ;
 *  - Géo'DAE : défibrillateurs de la base nationale, filtrés sur les 272 communes d'Indre-et-Loire (API tabulaire data.gouv) ;
 *  - Registre de preuve de covoiturage : trajets par commune et par an (CSV national de ≈ 7,6 Mo, lignes du 37 gardées) ;
 *  - Tours Métropole : points d'apport volontaire (verre : toute la métropole pour comparer ; textile), bancs.
 * Temps de téléchargement ajouté à la construction : ≈ 25 Mo, soit une dizaine de secondes.
 * Le code postal 37230 est partagé avec Fondettes : on filtre toujours sur le code INSEE.
 * Source écartée : couverture mobile (« Mon réseau mobile », ARCEP) — publiée en cartes nationales, sans statistique communale.
 */
import { readFile } from 'node:fs/promises';
import type { Source } from './sources.ts';

const ARCEP = 'https://data.arcep.fr/fixe/maconnexioninternet/statistiques';
/** Nombre d'années en arrière de la série « même trimestre chaque année ». */
const ARCEP_ANNEES = 4;
/** Nombre de trimestres récents ajoutés pour l'évolution trimestrielle. */
const ARCEP_TRIMESTRES_RECENTS = 3;

/** Trimestres publiés (« 2026_T2 »), lus dans l'index du serveur ARCEP. */
async function trimestresArcep(): Promise<{ annee: number; trimestre: number }[]> {
  const response = await fetch(`${ARCEP}/`, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`index ARCEP : HTTP ${response.status}`);
  const html = await response.text();
  const trouves = [...html.matchAll(/href="(\d{4})_T([1-4])\/index\.html"/g)].map((m) => ({ annee: Number(m[1]), trimestre: Number(m[2]) }));
  if (trouves.length === 0) throw new Error("aucun trimestre trouvé dans l'index ARCEP");
  return trouves.sort((a, b) => a.annee - b.annee || a.trimestre - b.trimestre);
}

/** Fichiers communaux : le dernier trimestre, les trimestres récents et le même trimestre des années précédentes. */
async function fichiersArcep(): Promise<string[]> {
  const publies = await trimestresArcep();
  const dernier = publies.at(-1);
  if (!dernier) throw new Error('aucun trimestre ARCEP');
  const recents = publies.slice(-1 - ARCEP_TRIMESTRES_RECENTS);
  const memeTrimestre = publies.filter((t) => t.trimestre === dernier.trimestre && t.annee >= dernier.annee - ARCEP_ANNEES);
  const choisis = new Map([...recents, ...memeTrimestre].map((t) => [`${t.annee}_T${t.trimestre}`, t]));
  return [...choisis.keys()].sort().map((id) => `${ARCEP}/${id}/commune/commune_techno.csv`);
}

const DATAGOUV_RESOURCE = 'https://www.data.gouv.fr/api/2/datasets/resources';
/** Ressource « covoiturage intermédié — commune » (l'adresse du fichier change à chaque mise à jour : on la lit dans la fiche). */
const COVOITURAGE_COMMUNE = '7f66eb8a-2e01-47dc-a703-fd5eaf5f20aa';

async function fichierCovoiturage(): Promise<string> {
  const response = await fetch(`${DATAGOUV_RESOURCE}/${COVOITURAGE_COMMUNE}/`, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`fiche data.gouv du covoiturage : HTTP ${response.status}`);
  const { resource } = (await response.json()) as { resource: { url: string } };
  return resource.url;
}

const GEODAE = 'https://tabular-api.data.gouv.fr/api/resources/edb6a9e1-2f16-4bbf-99e7-c3eb6b90794c/data/';
const GEODAE_COLONNES = [
  'c_com_insee',
  'c_nom',
  'c_acc',
  'c_etat',
  'c_etat_fonct',
  'c_doublon',
  'c_dispo_horaires',
  'c_dae_mobile',
  'c_lat_coor1',
  'c_long_coor1',
  'c_adr_voie',
].join(',');

/** Défibrillateurs des 272 communes du département : un seul appel filtré par la liste des codes INSEE (API Géo). */
async function daeDepartement37(): Promise<string> {
  const communes = JSON.parse(await readFile('data/raw/communes_37.json', 'utf8')) as { code: string }[];
  return `${GEODAE}?c_com_insee__in=${communes.map((c) => c.code).join(',')}&columns=${GEODAE_COLONNES}&page_size=200`;
}

const TOURS = 'https://data.tours-metropole.fr/api/explore/v2.1/catalog/datasets';
const where = (condition: string): string => encodeURIComponent(condition);

export const SOURCES_QUOTIDIEN: readonly Source[] = [
  {
    id: 'quotidien_fibre_37',
    description: "Locaux éligibles à la fibre et autres technologies par commune d'Indre-et-Loire, trimestres récents (ARCEP, « Ma connexion internet »)",
    url: fichiersArcep,
    format: 'csv-extrait',
    filtre: `code_dep = '37' AND type = 'all'`,
  },
  {
    id: 'quotidien_dae_37',
    description: "Défibrillateurs automatisés externes des communes d'Indre-et-Loire (Géo'DAE, ministère de la Santé)",
    url: daeDepartement37,
    pagination: 'tabular',
  },
  {
    id: 'quotidien_covoiturage_37',
    description: "Trajets de covoiturage intermédié par commune de départ et par an, Indre-et-Loire (Registre de preuve de covoiturage)",
    url: fichierCovoiturage,
    format: 'csv-extrait',
    separateur: ',',
    filtre: `geocode_commune LIKE '37%'`,
  },
  {
    id: 'quotidien_verre_metropole',
    description: "Points d'apport volontaire du verre dans les communes de Tours Métropole (portail open data de la métropole)",
    url: `${TOURS}/equipements-points-apport-volontaire-verre-tours-metropole-val-de-loire/exports/json?select=city_insee_code,city,geo_coordinates,geographic_address&limit=-1`,
  },
  {
    id: 'quotidien_textile_luynes',
    description: "Points d'apport volontaire du textile à Luynes (Tours Métropole)",
    url: `${TOURS}/equipements-points-apport-volontaire-textile-tours-metropole-val-de-loire/exports/json?where=${where('city_insee_code="37139"')}&select=name,geo_coordinates,geographic_address`,
  },
  {
    id: 'quotidien_bancs_luynes',
    description: 'Bancs publics de Luynes (inventaire de Tours Métropole)',
    url: `${TOURS}/bancs-tours-metropole-val-de-loire/exports/json?where=${where('code_insee="37139"')}&select=geo_point_2d`,
  },
];
