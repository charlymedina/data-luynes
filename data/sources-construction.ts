/**
 * Sources du thème « Construction » (sans clé, Licence Ouverte 2.0), API DiDo du SDES (ministère de la Transition
 * écologique) :
 *  - Sitadel : logements autorisés et commencés, séries mensuelles par commune (en date de prise en compte) ;
 *  - RPLS : répertoire des logements locatifs des bailleurs sociaux, détail au logement (sans l'adresse ici).
 * Le millésime le plus récent de chaque fichier est lu dans ses métadonnées avant le téléchargement.
 * L'API DiDo est lente (~20 s par page de 100 lignes) : on ne demande que Luynes et deux types de logements
 * (≈ 6 pages) ; pas de comparaison départementale (≈ 100 pages par année).
 */
import type { Source } from './sources.ts';

const DIDO = 'https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles';
const SITADEL = '577a8a66-4157-4787-b00a-031b61afea61';
const RPLS = 'f3c2f2cb-8fb1-40fd-8733-964247744c9a';

interface Metadonnees {
  millesime?: string;
  millesimes?: { millesime: string }[];
}

/** Millésime le plus récent d'un fichier DiDo (ex. « 2026-10 »). */
async function dernierMillesime(rid: string): Promise<string> {
  const response = await fetch(`${DIDO}/${rid}`, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`DiDo ${rid} : HTTP ${response.status}`);
  const meta = (await response.json()) as Metadonnees;
  const millesime = meta.millesime ?? meta.millesimes?.map((m) => m.millesime).sort().at(-1);
  if (!millesime) throw new Error(`DiDo ${rid} : millésime introuvable`);
  return millesime;
}

const sitadelLuynes = async (): Promise<string> =>
  `${DIDO}/${SITADEL}/rows?millesime=${await dernierMillesime(SITADEL)}&CODE_INSEE=eq:37139&TYPE_LGT=in:Tous%20Logements,Collectif&pageSize=100`;

const RPLS_COLONNES = ['DEPCOM', 'NBPIECE', 'SURFHAB', 'CONSTRUCT', 'DPEENERGIE', 'TYPECONST_LIBELLE'].join(',');

const rplsLuynes = async (): Promise<string> =>
  `${DIDO}/${RPLS}/rows?millesime=${await dernierMillesime(RPLS)}&DEPCOM=eq:37139&columns=${RPLS_COLONNES}&pageSize=100`;

export const SOURCES_CONSTRUCTION: readonly Source[] = [
  {
    id: 'sitadel_luynes',
    description: 'Logements autorisés et commencés à Luynes par mois (tous logements et collectifs), depuis 2002 (SDES, Sitadel)',
    url: sitadelLuynes,
    pagination: 'dido',
  },
  {
    id: 'rpls_luynes',
    description: 'Logements sociaux de Luynes, au logement (SDES, répertoire RPLS)',
    url: rplsLuynes,
    pagination: 'dido',
  },
];
