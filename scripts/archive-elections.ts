/**
 * Archive des résultats électoraux (1999 → dernier scrutin) dans le dépôt : data/archive/elections/<extrait>.parquet.
 *
 * Pourquoi : la source est un fichier national agrégé par bureau de vote (data.gouv.fr, ~230 Mo en deux fichiers
 * Parquet). DuckDB sait n'en lire que les colonnes et les lignes utiles à distance, mais les sommes « France entière »
 * demandent de parcourir tout le fichier. On ne le fait donc que lorsque la source a changé (nouvelle élection), et on
 * garde ici de petits extraits : Luynes, l'Indre-et-Loire et la France.
 *
 * Étapes :
 *  1. on lit la date de dernière modification des deux fichiers sources (requête HEAD) ;
 *  2. si elle n'a pas changé depuis la dernière archive (manifest.json) et que les extraits existent, rien à faire ;
 *  3. sinon, chaque requête data/sql/elections/<extrait>.sql est exécutée sur les fichiers distants et son résultat
 *     enregistré en Parquet.
 * Si la source est injoignable, la construction continue avec l'archive existante.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { DuckDBConnection } from '@duckdb/node-api';

const SOURCE = 'https://data-pipeline-open.s3.sbg.io.cloud.ovh.net/elections';
const FICHIERS = {
  general: `${SOURCE}/general_results.parquet`,
  candidats: `${SOURCE}/candidats_results.parquet`,
} as const;
type Fichier = keyof typeof FICHIERS;
type Manifest = Partial<Record<Fichier, string>>;

const ARCHIVE_DIR = 'data/archive/elections';
const SQL_DIR = 'data/sql/elections';
const MANIFEST = path.join(ARCHIVE_DIR, 'manifest.json');
const TIMEOUT_MS = 60_000;

/** Date de dernière modification (ou empreinte) d'un fichier distant. */
async function version(url: string): Promise<string> {
  const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`HTTP ${response.status} pour ${url}`);
  return response.headers.get('etag') ?? response.headers.get('last-modified') ?? '';
}

async function lireManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8')) as Manifest;
  } catch {
    return {};
  }
}

async function extraits(): Promise<string[]> {
  return (await readdir(SQL_DIR)).filter((f) => f.endsWith('.sql')).map((f) => path.basename(f, '.sql'));
}

async function extraire(connection: DuckDBConnection, nom: string): Promise<void> {
  const sql = (await readFile(path.join(SQL_DIR, `${nom}.sql`), 'utf8'))
    .replaceAll('{general}', FICHIERS.general)
    .replaceAll('{candidats}', FICHIERS.candidats)
    .trim()
    .replace(/;\s*$/, '');
  await connection.run(`COPY (${sql}) TO '${path.join(ARCHIVE_DIR, `${nom}.parquet`)}' (FORMAT parquet, COMPRESSION zstd)`);
  console.log(`↻ Élections : ${nom} archivé`);
}

export async function archiverElections(connection: DuckDBConnection): Promise<void> {
  await mkdir(ARCHIVE_DIR, { recursive: true });
  const manifest = await lireManifest();
  const noms = await extraits();
  const complet = noms.every((nom) => existsSync(path.join(ARCHIVE_DIR, `${nom}.parquet`)));

  let actuel: Manifest;
  try {
    actuel = { general: await version(FICHIERS.general), candidats: await version(FICHIERS.candidats) };
  } catch (error: unknown) {
    if (!complet) throw error;
    console.warn(`… élections : source injoignable, archive existante utilisée (${error instanceof Error ? error.message : error})`);
    return;
  }

  if (complet && actuel.general === manifest.general && actuel.candidats === manifest.candidats) {
    console.log('= Élections : archive à jour');
    return;
  }
  for (const nom of noms) await extraire(connection, nom);
  await writeFile(MANIFEST, `${JSON.stringify(actuel, null, 2)}\n`);
}
