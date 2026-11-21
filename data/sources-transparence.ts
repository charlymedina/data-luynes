/**
 * Sources du thème « Transparence » (sans clé, Licence Ouverte 2.0) :
 *  - balances comptables de la commune (DGFiP, compte par compte, un jeu par année) et des communes de France
 *    (uniquement les comptes utiles, dernière année) pour comparer avec les communes de même taille ;
 *  - marchés publics attribués (DECP consolidées, data.gouv.fr) ;
 *  - appels d'offres publiés (BOAMP, DILA) ;
 *  - répertoire national des élus (ministère de l'Intérieur), sans nom ni prénom sauf pour le maire.
 */
import type { Source } from './sources.ts';
import { jeuxComptes } from './sources-budget.ts';

const PORTAIL = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets';
const PREFIXE_BALANCES = 'balances-comptables-des-communes-en-';
/** SIREN de la commune de Luynes (les 9 premiers chiffres du SIRET 21370139400016). */
const SIREN_LUYNES = '213701394';
/** SIRET de la mairie, tel qu'il figure dans les marchés publics (DECP). */
const SIRET_MAIRIE = `${SIREN_LUYNES}00016`;

/**
 * Comptes lus pour comparer les communes : indemnités des élus (65311, ancien 6531), subventions aux associations
 * (65748, ancien 6574) et subvention au CCAS (657363, ancien 657362).
 */
const COMPTES_COMPARAISON = ['65311', '6531', '65748', '6574', '657363', '657362'];

/** Année d'un jeu de balances, lue dans son identifiant (« …-en-2025 » → 2025). */
function anneeBalances(id: string): number {
  return Number(/(\d{4})$/.exec(id)?.[1] ?? 0);
}

/** Identifiants de tous les jeux « balances comptables des communes », du plus ancien au plus récent. */
async function jeuxBalances(): Promise<string[]> {
  const recherche = encodeURIComponent(`dataset_id like "${PREFIXE_BALANCES}*"`);
  const response = await fetch(`${PORTAIL}?where=${recherche}&select=dataset_id&limit=100`, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`catalogue DGFiP : HTTP ${response.status}`);
  const { results } = (await response.json()) as { results: { dataset_id: string }[] };
  const ids = results.map((r) => r.dataset_id).filter((id) => /-en-\d{4}$/.test(id));
  if (ids.length === 0) throw new Error('catalogue DGFiP : aucun jeu « balances comptables » trouvé');
  return ids.sort((a, b) => anneeBalances(a) - anneeBalances(b));
}

function exportCsv(id: string, filtre: string, colonnes: string): string {
  return `${PORTAIL}/${id}/exports/csv?where=${encodeURIComponent(filtre)}&select=${colonnes}`;
}

/** Résolution de la redirection « …/datasets/r/<id> » de data.gouv (DuckDB lit mieux l'adresse finale). */
async function adresseFinale(url: string): Promise<string> {
  const response = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(30_000) });
  return response.headers.get('location') ?? url;
}

const TABULAR_RNE = 'https://tabular-api.data.gouv.fr/api/resources/d5f400de-ae3f-4966-8cb6-a85c70c6c24a/data/';
const COMMUNE_RNE = 'Code%20de%20la%20commune__exact=37139';
/** Colonnes du répertoire des élus SANS le nom ni le prénom (agrégats uniquement). */
const COLONNES_CONSEIL = [
  'Code sexe',
  'Date de naissance',
  'Code de la catégorie socio-professionnelle',
  'Libellé de la fonction',
  'Date de début du mandat',
]
  .map(encodeURIComponent)
  .join(',');
/** Pour le maire seul : nom et prénom (information publique du répertoire). */
const COLONNES_MAIRE = ["Nom de l'élu", "Prénom de l'élu", 'Libellé de la fonction', 'Date de début du mandat']
  .map(encodeURIComponent)
  .join(',');

export const SOURCES_TRANSPARENCE: readonly Source[] = [
  {
    id: 'balances_luynes',
    description: 'Balances comptables de Luynes année par année depuis 2010 (DGFiP, compte par compte)',
    url: async () =>
      (await jeuxBalances()).map((id) => exportCsv(id, `siren="${SIREN_LUYNES}"`, 'exer,compte,sd,sc')),
    format: 'fichiers',
  },
  {
    id: 'balances_communes_france',
    description: 'Indemnités des élus et subventions de toutes les communes de France, dernière année (balances DGFiP)',
    url: async () => {
      const dernier = (await jeuxBalances()).at(-1) as string;
      const comptes = COMPTES_COMPARAISON.map((c) => `"${c}"`).join(',');
      return exportCsv(dernier, `compte in (${comptes})`, 'exer,ndept,insee,compte,sd,sc');
    },
    format: 'fichiers',
  },
  {
    id: 'populations_communes_france',
    description: 'Population DGFiP et strate de toutes les communes de France, dernière année (comptes individuels)',
    url: async () => {
      const dernier = (await jeuxComptes()).at(-1) as string;
      return `${PORTAIL}/${dernier}/exports/csv?select=an,dep,icom,pop1,nomsst1`;
    },
    format: 'fichiers',
  },
  {
    id: 'decp_luynes',
    description: 'Marchés publics attribués par la mairie de Luynes (données essentielles de la commande publique consolidées)',
    url: () => adresseFinale('https://www.data.gouv.fr/api/1/datasets/r/11cea8e8-df3e-4ed1-932b-781e2635e432'),
    format: 'parquet-extrait',
    filtre: `acheteur_id = '${SIRET_MAIRIE}'`,
    colonnes: [
      'uid', 'id', 'nature', 'acheteur_id', 'titulaire_id', 'titulaire_nom', 'titulaire_categorie', 'titulaire_commune_nom', 'objet',
      'montant', 'type', 'procedure', 'dateNotification', 'datePublicationDonnees', 'dureeMois', 'modification_id',
      'donneesActuelles', 'idAccordCadre', 'montant_anomalie',
    ],
  },
  {
    id: 'boamp_luynes',
    description: "Avis d'appel d'offres publiés par la mairie de Luynes (BOAMP, DILA)",
    url: `https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/exports/csv?where=${encodeURIComponent('search(nomacheteur,"luynes")')}&select=idweb,objet,dateparution,famille_libelle,nomacheteur,nature,etat,procedure_libelle,type_marche_facette,annonce_lie`,
    format: 'fichiers',
  },
  {
    id: 'rne_conseil',
    description: 'Conseil municipal de Luynes : sexe, âge, profession, fonction (répertoire national des élus, sans nom)',
    url: `${TABULAR_RNE}?${COMMUNE_RNE}&page_size=50&columns=${COLONNES_CONSEIL}`,
    pagination: 'tabular',
  },
  {
    id: 'rne_maire',
    description: 'Maire de Luynes (répertoire national des élus)',
    url: `${TABULAR_RNE}?${COMMUNE_RNE}&Libell%C3%A9%20de%20la%20fonction__exact=Maire&page_size=5&columns=${COLONNES_MAIRE}`,
    pagination: 'tabular',
  },
];
