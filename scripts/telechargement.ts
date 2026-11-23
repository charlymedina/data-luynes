/**
 * Logique du téléchargement incrémental et de l'alerte « source qui change brutalement » (utilisée par build-data.ts).
 * Ce fichier ne fait aucun téléchargement lui-même (sauf les requêtes HEAD de `signatureDepuisAdresses`) :
 * ce sont des fonctions simples, testées dans tests/telechargement.test.ts.
 *
 * Le manifeste data/raw/_manifest.json (gardé d'une construction à l'autre par le cache GitHub Actions) note, pour
 * chaque source : sa « définition » (adresse, filtre… : si elle change, on retélécharge), sa « signature » (ETag ou
 * Last-Modified de chaque adresse, quand le serveur en donne), la date du dernier téléchargement et la taille
 * obtenue (lignes ou octets), qui sert à repérer un changement brutal.
 */
import { createHash } from 'node:crypto';

/** Sans signature utilisable, une source est réutilisée pendant ce nombre de jours (réglable par source : `validiteJours`). */
export const VALIDITE_PAR_DEFAUT_JOURS = 7;
/** Même avec une signature inchangée, on retélécharge au plus tard après ce délai (garde-fou contre un ETag trompeur). */
export const AGE_MAX_AVEC_SIGNATURE_JOURS = 30;
/** Variation (en %) au-delà de laquelle une alerte est émise (réglable par source : `seuilAlertePct`). */
export const SEUIL_ALERTE_PAR_DEFAUT_PCT = 10;
/** Sous cet écart absolu de lignes, aucune alerte (3 → 4 lignes n'est pas un événement). */
export const ECART_MIN_LIGNES = 5;
/** Idem en octets (les sources dont on ne sait pas compter les lignes). */
export const ECART_MIN_OCTETS = 2_048;

export interface Mesure {
  /** Nombre de lignes (JSON, Parquet) — absent pour les sources « fichiers » */
  lignes?: number;
  octets: number;
}

export interface EntreeManifeste extends Mesure {
  definition: string;
  /** Empreinte des ETag / Last-Modified des adresses au moment du téléchargement (absente si le serveur n'en donne pas) */
  signature?: string;
  /** AAAA-MM-JJ du dernier téléchargement */
  telechargeLe: string;
  /** AAAA-MM-JJ de la dernière fois où la source a été confirmée à jour (téléchargée ou signature identique) */
  verifieLe: string;
}

export type Manifeste = Record<string, EntreeManifeste>;

export interface Alerte {
  id: string;
  description: string;
  /** Ce qui a été comparé */
  mesure: 'lignes' | 'octets';
  avant: number;
  apres: number;
  /** Variation en % (négatif = baisse), arrondie à 0,1 */
  variationPct: number;
  seuilPct: number;
}

export const hacher = (texte: string): string => createHash('sha256').update(texte).digest('hex').slice(0, 16);

/** Nombre de jours entiers entre deux dates AAAA-MM-JJ. */
export function joursEntre(debut: string, fin: string): number {
  return Math.round((Date.parse(`${fin}T00:00:00Z`) - Date.parse(`${debut}T00:00:00Z`)) / 86_400_000);
}

export type Decision =
  | { action: 'telecharger'; raison: string }
  | { action: 'reutiliser'; raison: string; /** la signature a été comparée : la date de vérification est mise à jour */ confirmee: boolean };

export interface ContexteDecision {
  entree: EntreeManifeste | undefined;
  definition: string;
  fichierLocalPresent: boolean;
  force: boolean;
  validiteJours: number;
  /** AAAA-MM-JJ */
  aujourdhui: string;
  /** Signature actuelle des adresses (requêtes HEAD) ; undefined si le serveur n'en donne pas. Appelée seulement si utile. */
  signatureActuelle: () => Promise<string | undefined>;
}

/** Faut-il retélécharger la source ? Ordre : option --force, absence de version locale, définition modifiée, signature, durée de validité. */
export async function decider(ctx: ContexteDecision): Promise<Decision> {
  const { entree } = ctx;
  if (ctx.force) return { action: 'telecharger', raison: 'forcé' };
  if (!entree || !ctx.fichierLocalPresent) return { action: 'telecharger', raison: 'pas de version locale' };
  if (entree.definition !== ctx.definition) return { action: 'telecharger', raison: 'définition de la source modifiée' };

  const age = joursEntre(entree.telechargeLe, ctx.aujourdhui);
  if (entree.signature !== undefined && age < AGE_MAX_AVEC_SIGNATURE_JOURS) {
    const actuelle = await ctx.signatureActuelle();
    if (actuelle !== undefined) {
      return actuelle === entree.signature
        ? { action: 'reutiliser', raison: 'inchangée à la source (ETag / Last-Modified)', confirmee: true }
        : { action: 'telecharger', raison: 'modifiée à la source' };
    }
    // Le serveur ne répond plus aux requêtes HEAD : on retombe sur la durée de validité.
  }
  if (age < ctx.validiteJours) return { action: 'reutiliser', raison: `téléchargée il y a ${age} j (validité ${ctx.validiteJours} j)`, confirmee: false };
  return { action: 'telecharger', raison: `téléchargée il y a ${age} j (validité ${ctx.validiteJours} j)` };
}

/** Signature d'un ensemble d'adresses à partir de leurs en-têtes ; undefined si l'une n'a ni ETag ni Last-Modified. */
export function signatureDepuisEntetes(entetes: { url: string; etag: string | null; lastModified: string | null }[]): string | undefined {
  if (entetes.length === 0) return undefined;
  const lignes: string[] = [];
  for (const e of entetes) {
    const version = e.etag ?? e.lastModified;
    if (!version) return undefined;
    lignes.push(`${e.url}\t${version}`);
  }
  return hacher(lignes.sort().join('\n'));
}

const TIMEOUT_HEAD_MS = 30_000;

/** Interroge chaque adresse par HEAD (une seule tentative) ; undefined au moindre échec ou en l'absence de validateurs. */
export async function signatureDepuisAdresses(urls: string[]): Promise<string | undefined> {
  try {
    const entetes = await Promise.all(
      urls.map(async (url) => {
        const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(TIMEOUT_HEAD_MS) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return { url, etag: response.headers.get('etag'), lastModified: response.headers.get('last-modified') };
      }),
    );
    return signatureDepuisEntetes(entetes);
  } catch {
    return undefined;
  }
}

/** Nombre de lignes d'un JSON déjà lu : tableau, ou premier tableau parmi data / features / results / records. */
export function compterLignesJson(contenu: unknown): number | undefined {
  if (Array.isArray(contenu)) return contenu.length;
  if (contenu && typeof contenu === 'object') {
    for (const cle of ['data', 'features', 'results', 'records']) {
      const valeur = (contenu as Record<string, unknown>)[cle];
      if (Array.isArray(valeur)) return valeur.length;
    }
  }
  return undefined;
}

/** Compare deux mesures ; renvoie une alerte si la variation dépasse le seuil (et l'écart minimal). */
export function evaluerVariation(
  source: { id: string; description: string; seuilAlertePct?: number },
  avant: Mesure | undefined,
  apres: Mesure,
): Alerte | null {
  if (!avant) return null;
  const seuilPct = source.seuilAlertePct ?? SEUIL_ALERTE_PAR_DEFAUT_PCT;
  const parLignes = avant.lignes !== undefined && apres.lignes !== undefined;
  const mesure = parLignes ? 'lignes' : 'octets';
  const valeurAvant = parLignes ? (avant.lignes as number) : avant.octets;
  const valeurApres = parLignes ? (apres.lignes as number) : apres.octets;
  const ecart = valeurApres - valeurAvant;
  if (Math.abs(ecart) < (parLignes ? ECART_MIN_LIGNES : ECART_MIN_OCTETS)) return null;
  // Une source qui se vide (ou qui apparaît) est toujours signalée ; sinon on compare au seuil.
  const variation = valeurAvant === 0 ? Number.POSITIVE_INFINITY : (ecart / valeurAvant) * 100;
  if (Math.abs(variation) <= seuilPct) return null;
  return {
    id: source.id,
    description: source.description,
    mesure,
    avant: valeurAvant,
    apres: valeurApres,
    variationPct: Number.isFinite(variation) ? Math.round(variation * 10) / 10 : 100,
    seuilPct,
  };
}

/** Texte (Markdown) de l'issue GitHub « Alerte sources de données » ; chaîne vide s'il n'y a aucune alerte. */
export function corpsIssueAlertes(alertes: readonly Alerte[], jour: string): string {
  if (alertes.length === 0) return '';
  const lignes = alertes.map((a) => {
    const sens = a.variationPct >= 0 ? '+' : '';
    const description = a.description.replaceAll('|', '/');
    return `| \`${a.id}\` | ${description} | ${a.avant} ${a.mesure} | ${a.apres} ${a.mesure} | ${sens}${a.variationPct} % (seuil ±${a.seuilPct} %) |`;
  });
  return [
    `Au moins une source de données a changé de taille de façon inhabituelle lors de la construction du ${jour}.`,
    "La publication n'a **pas** été bloquée ; ces changements peuvent être légitimes (nouveau millésime, nettoyage)",
    'ou venir d\'une source cassée. À vérifier avant de se fier aux chiffres concernés.',
    '',
    '| Source | Description | Avant | Après | Variation |',
    '|---|---|---|---|---|',
    ...lignes,
    '',
    "_Issue gérée automatiquement par le workflow de construction (une seule issue ouverte à la fois). La fermer une fois les chiffres vérifiés._",
    '',
  ].join('\n');
}
