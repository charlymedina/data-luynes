/**
 * Sources du thème « Écoles, santé & services » (toutes sans clé) :
 *  - INSEE, base permanente des équipements (BPE) via l'API Melodi : nombre de commerces, services,
 *    professionnels de santé… par commune ; libellés des codes dans data/reference/bpe_libelles.csv ;
 *  - Éducation nationale (data.education.gouv.fr) : annuaire des écoles et effectifs d'élèves par école.
 * Attention : dans les effectifs, la colonne « code_commune_insee » contient en fait le code postal (37230,
 * partagé avec Fondettes) : on filtre donc sur le nom de la commune et le département.
 */
import { readFile } from 'node:fs/promises';
import type { Source } from './sources.ts';

const MELODI = 'https://api.insee.fr/melodi/data';
const EDUCATION = 'https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets';

/** Paramètres GEO=COM-xxxxx des 272 communes du département (liste API Géo déjà téléchargée). */
async function geoCommunes37(): Promise<string> {
  const communes = JSON.parse(await readFile('data/raw/communes_37.json', 'utf8')) as { code: string }[];
  return communes.map((c) => `GEO=COM-${c.code}`).join('&');
}

const where = (expression: string): string => encodeURIComponent(expression);

const TABULAR = 'https://tabular-api.data.gouv.fr/api/resources';
/** Bibliothèques des collectivités territoriales : adresses et données d'activité (enquête annuelle SLL, ministère de la Culture). */
const BIBLIOTHEQUES = '806a8aa1-952f-404d-9857-3f27b7c0ca86';
/** Jeu « Résultats de campagnes de télédéclaration des cantines » (Ma Cantine, ministère de l'Agriculture) : un fichier CSV par année. */
const JEU_MA_CANTINE = '6482ed2ee3f9ec5215b41828';

/**
 * Adresses (une par année publiée) des télédéclarations « Ma Cantine » filtrées sur Luynes. La liste des fichiers annuels
 * est lue dans le catalogue data.gouv.fr à chaque construction (un nouveau fichier arrive chaque année).
 */
async function cantinesLuynes(): Promise<string[]> {
  const response = await fetch(`https://www.data.gouv.fr/api/1/datasets/${JEU_MA_CANTINE}/`, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`catalogue data.gouv (Ma Cantine) : HTTP ${response.status}`);
  const jeu = (await response.json()) as { resources: { id: string; title: string; format: string }[] };
  const fichiers = jeu.resources.filter((r) => r.format === 'csv' && /\(données \d{4}\)\s*$/.test(r.title));
  if (fichiers.length === 0) throw new Error('aucun fichier annuel « Ma Cantine » trouvé');
  return fichiers.map((r) => `${TABULAR}/${r.id}/data/?canteen_city_insee_code__exact=37139&page_size=50`);
}

export const SOURCES_EQUIPEMENTS: readonly Source[] = [
  {
    id: 'bpe_luynes',
    description: 'Équipements de Luynes par type : commerces, services, santé… (INSEE, BPE)',
    url: `${MELODI}/DS_BPE?GEO=COM-37139&maxResult=10000`,
  },
  {
    id: 'bpe_37',
    description: "Équipements de l'Indre-et-Loire par type (INSEE, BPE)",
    url: `${MELODI}/DS_BPE?GEO=DEP-37&maxResult=10000`,
  },
  {
    id: 'bpe_communes_37',
    description: "Nombre d'équipements par grand domaine dans chaque commune d'Indre-et-Loire (INSEE, BPE)",
    url: async () => `${MELODI}/DS_BPE?${await geoCommunes37()}&FACILITY_SDOM=_T&FACILITY_TYPE=_T&maxResult=10000`,
  },
  {
    id: 'ecoles_luynes',
    description: 'Écoles et collège de Luynes : nom, public/privé, position (Éducation nationale, annuaire)',
    url:
      `${EDUCATION}/fr-en-annuaire-education/exports/json?where=${where('code_commune="37139"')}` +
      '&select=identifiant_de_l_etablissement,nom_etablissement,type_etablissement,statut_public_prive,ecole_maternelle,ecole_elementaire,latitude,longitude,etat',
  },
  {
    id: 'effectifs_ecoles_luynes',
    description: 'Élèves et classes des écoles de Luynes à chaque rentrée depuis 2011 (Éducation nationale)',
    url:
      `${EDUCATION}/fr-en-ecoles-effectifs-nb_classes/exports/json?where=${where('code_departement="37" and commune="LUYNES"')}` +
      '&select=rentree_scolaire,numero_ecole,patronyme,secteur,nombre_total_classes,nombre_total_eleves,nombre_eleves_preelementaire_hors_ulis,nombre_eleves_elementaire_hors_ulis',
  },
  {
    // Dans les jeux IPS et collèges, la colonne commune contient bien le code INSEE (37139) ; on filtre
    // en plus sur les établissements de l'annuaire (UAI) dans le SQL, par prudence.
    id: 'ips_ecoles_luynes',
    description: 'Indice de position sociale (IPS) des écoles de Luynes, depuis la rentrée 2022 (Éducation nationale)',
    url: `${EDUCATION}/fr-en-ips-ecoles-ap2022/exports/json?where=${where('code_insee_de_la_commune="37139"')}`,
  },
  {
    id: 'ips_college_luynes',
    description: 'Indice de position sociale (IPS) du collège de Luynes, depuis la rentrée 2023 (Éducation nationale)',
    url: `${EDUCATION}/fr-en-ips-colleges-ap2023/exports/json?where=${where('code_insee_de_la_commune="37139"')}`,
  },
  {
    id: 'effectifs_college_luynes',
    description: 'Élèves du collège de Luynes par niveau (6ᵉ à 3ᵉ) à chaque rentrée (Éducation nationale)',
    url:
      `${EDUCATION}/fr-en-college-effectifs-niveau-sexe-lv/exports/json?where=${where('code_commune="37139"')}` +
      '&select=rentree_scolaire,numero_college,patronyme,nombre_eleves_total,nombre_total_de_6emes,nombre_total_de_5emes,nombre_total_de_4emes,nombre_total_de_3emes',
  },
  {
    id: 'effectifs_ecoles_37',
    description: "Élèves et classes des écoles d'Indre-et-Loire à chaque rentrée (Éducation nationale)",
    url:
      `${EDUCATION}/fr-en-ecoles-effectifs-nb_classes/exports/json?where=${where('code_departement="37"')}` +
      `&select=${where('rentree_scolaire,sum(nombre_total_eleves) as eleves,sum(nombre_total_classes) as classes')}&group_by=rentree_scolaire`,
  },
  {
    id: 'mediatheque_luynes',
    description: "Médiathèque de Luynes : prêts, emprunteurs, collections, horaires (enquête annuelle du Service du livre et de la lecture, ministère de la Culture)",
    url: `${TABULAR}/${BIBLIOTHEQUES}/data/?code_insee_commune__exact=37139&page_size=50`,
    pagination: 'tabular',
  },
  {
    id: 'cantines_luynes',
    description: 'Cantines de Luynes : part de produits bio et durables (télédéclarations « Ma Cantine », loi EGalim)',
    url: cantinesLuynes,
    pagination: 'tabular',
  },
  {
    id: 'mediatheque_jeu',
    description: "Fiche du jeu « Bibliothèques des collectivités territoriales » sur data.gouv.fr (année de l'enquête, lue dans sa description)",
    url: 'https://www.data.gouv.fr/api/1/datasets/5c3538da9ce2e7459c6d765a/',
  },
];
