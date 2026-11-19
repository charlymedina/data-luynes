/**
 * Sources du thème « Budget de la commune » : comptes individuels des communes publiés par la DGFiP
 * (ministère de l'Économie) sur data.economie.gouv.fr (portail Opendatasoft, sans clé).
 *
 * La DGFiP publie un jeu par année ou groupe d'années, avec des noms irréguliers
 * (« …-fichier-global-2008 » contient 2000→2008, « …-20090 » contient 2009, « …-2023-2024 »…) :
 * on retrouve la liste à chaque construction via le catalogue du portail, sans rien écrire en dur.
 * Montants en milliers d'euros ; colonnes « f… » = par habitant (€), « m… » = moyenne de la strate (€ par habitant).
 */
import type { Source } from './sources.ts';

const PORTAIL = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets';
const PREFIXE_JEU = 'comptes-individuels-des-communes-fichier-global-';

/** Colonnes utiles (même nom dans tous les millésimes, vérifié de 2000 à 2025). */
const COLONNES_LUYNES = [
  'an', 'pop1', 'nomsst1',
  // Fonctionnement (montants en k€) et sa décomposition
  'prod', 'charge', 'perso', 'achat', 'subv', 'fin', 'cont', 'impo1', 'dgf',
  // Investissement, autofinancement, dette (k€)
  'depinv', 'equip', 'emp', 'caf', 'cafn', 'dette', 'annu',
  // Par habitant (f…) et moyenne de la strate par habitant (m…)
  'fprod', 'mprod', 'fcharge', 'mcharge', 'fimpo1', 'mimpo1', 'fdgf', 'mdgf', 'fperso', 'mperso',
  'fequip', 'mequip', 'fcaf', 'mcaf', 'fdette', 'mdette', 'fannu', 'mannu',
  // Taux de taxe foncière (bâti, non bâti) de la commune et moyenne de la strate (%)
  'tfb', 'tmfb', 'tfnb', 'tmfnb',
].join(',');

/** Colonnes pour comparer les 272 communes du département (dernière année). */
const COLONNES_DEPARTEMENT = 'an,icom,inom,pop1,fcharge,fequip,fdette,fcaf,fimpo1,tfb';

/** Filtre Opendatasoft : département codé sur 3 caractères, commune sur 3 (« 037 » + « 139 » = 37139). */
const FILTRE_LUYNES = encodeURIComponent('dep="037" and icom="139"');
const FILTRE_37 = encodeURIComponent('dep="037"');

/** Dernière année couverte par un jeu, lue dans son identifiant (« 2023-2024 » → 2024, « 20090 » → 2009). */
function derniereAnnee(id: string): number {
  return Number(/(\d{4})\d?$/.exec(id)?.[1] ?? 0);
}

/** Identifiants de tous les jeux « comptes individuels des communes », triés du plus ancien au plus récent. */
async function jeuxComptes(): Promise<string[]> {
  const recherche = encodeURIComponent(`dataset_id like "${PREFIXE_JEU}*"`);
  const response = await fetch(`${PORTAIL}?where=${recherche}&select=dataset_id&limit=100`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`catalogue DGFiP : HTTP ${response.status}`);
  const { results } = (await response.json()) as { results: { dataset_id: string }[] };
  const ids = results.map((r) => r.dataset_id).filter((id) => id.startsWith(PREFIXE_JEU));
  if (ids.length === 0) throw new Error('catalogue DGFiP : aucun jeu « comptes individuels » trouvé');
  return ids.sort((a, b) => derniereAnnee(a) - derniereAnnee(b));
}

function exportCsv(id: string, filtre: string, colonnes: string): string {
  return `${PORTAIL}/${id}/exports/csv?where=${filtre}&select=${colonnes}`;
}

export const SOURCES_BUDGET: readonly Source[] = [
  {
    id: 'budget_luynes',
    description: 'Comptes de Luynes année par année depuis 2000 (DGFiP, comptes individuels des communes)',
    url: async () => (await jeuxComptes()).map((id) => exportCsv(id, FILTRE_LUYNES, COLONNES_LUYNES)),
    format: 'fichiers',
  },
  {
    id: 'budget_communes_37',
    description: "Comptes des 272 communes d'Indre-et-Loire, dernière année publiée (DGFiP)",
    url: async () => {
      const dernier = (await jeuxComptes()).at(-1) as string;
      return exportCsv(dernier, FILTRE_37, COLONNES_DEPARTEMENT);
    },
    format: 'fichiers',
  },
];
