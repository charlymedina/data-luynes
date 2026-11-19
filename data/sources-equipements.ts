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
    id: 'effectifs_ecoles_37',
    description: "Élèves et classes des écoles d'Indre-et-Loire à chaque rentrée (Éducation nationale)",
    url:
      `${EDUCATION}/fr-en-ecoles-effectifs-nb_classes/exports/json?where=${where('code_departement="37"')}` +
      `&select=${where('rentree_scolaire,sum(nombre_total_eleves) as eleves,sum(nombre_total_classes) as classes')}&group_by=rentree_scolaire`,
  },
];
