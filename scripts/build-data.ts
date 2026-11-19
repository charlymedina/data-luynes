/**
 * Prépare les données du site, en deux étapes :
 *  1. télécharge chaque source listée dans data/sources.ts vers data/raw/<id>.json
 *     (ou, pour les sources au format « fichiers » comme les CSV compressés, vers le dossier data/raw/<id>/) ;
 *  2. exécute les requêtes de data/sql/ avec DuckDB :
 *     - les fichiers qui commencent par « _ » (ex. _melodi.sql) sont exécutés en premier : ils préparent
 *       des vues partagées par plusieurs requêtes et ne produisent pas de fichier ;
 *     - chaque autre fichier <nom>.sql produit src/data/generated/<nom>.json, que les pages importent.
 *  (entre les deux, les ventes DVF sont archivées dans data/archive/dvf/ : voir scripts/archive-dvf.ts)
 *
 * Règle simple : un fichier .sql = un fichier .json. Chaque requête doit renvoyer au moins une ligne,
 * sinon la construction s'arrête (et le site déjà en ligne reste inchangé).
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { DuckDBInstance, type DuckDBConnection } from '@duckdb/node-api';
import { SOURCES, type Source } from '../data/sources.ts';
import { archiverDvf } from './archive-dvf.ts';

const RAW_DIR = 'data/raw';
const SQL_DIR = 'data/sql';
const OUTPUT_DIR = 'src/data/generated';
const FETCH_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2_000;

/** Une source peut demander une seule adresse ou plusieurs (résultats fusionnés). */
async function resolveUrls(source: Source): Promise<string[]> {
  const urls = typeof source.url === 'string' ? source.url : await source.url();
  return Array.isArray(urls) ? urls : [urls];
}

/** Garde-fou : une source paginée ne doit jamais faire tourner le build en boucle. */
const MAX_PAGES = 100;

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return JSON.parse(await response.text()); // échoue tôt si la source ne renvoie pas du JSON valide
}

interface Page {
  data: unknown[];
  next: string | null;
}

/** Lit une page Géorisques ({ data, page, total_pages }) et calcule l'adresse de la suivante. */
function pageGeorisques(body: unknown, url: string): Page {
  const { data, page, total_pages } = body as { data: unknown[]; page: number; total_pages: number };
  const next = new URL(url);
  next.searchParams.set('page', String(page + 1));
  return { data, next: page < total_pages ? next.toString() : null };
}

/** Lit une page de l'API tabulaire data.gouv ({ data, links: { next } }). */
function pageTabular(body: unknown): Page {
  const { data, links } = body as { data: unknown[]; links: { next: string | null } };
  return { data, next: links.next };
}

/** Récupère toutes les pages d'une adresse paginée et renvoie l'ensemble des lignes. */
async function fetchAllPages(source: Source, firstUrl: string): Promise<unknown[]> {
  const rows: unknown[] = [];
  let url: string | null = firstUrl;
  for (let count = 0; url !== null; count++) {
    if (count === MAX_PAGES) throw new Error(`plus de ${MAX_PAGES} pages`);
    const body = await getJson(url);
    const page: Page = source.pagination === 'georisques' ? pageGeorisques(body, url) : pageTabular(body);
    rows.push(...(page.data ?? []));
    url = page.next;
  }
  return rows;
}

/** Télécharge la source ; les sources paginées ou multi-adresses sont fusionnées en { "data": [...] }. */
async function fetchJson(source: Source): Promise<string> {
  const urls = await resolveUrls(source);
  if (!source.pagination) {
    if (urls.length !== 1) throw new Error('plusieurs adresses demandent une pagination déclarée');
    return JSON.stringify(await getJson(urls[0] as string));
  }
  const rows: unknown[] = [];
  for (const url of urls) rows.push(...(await fetchAllPages(source, url)));
  return JSON.stringify({ data: rows });
}

/** Nom de fichier lisible tiré des 3 derniers segments de l'adresse (ex. « 2024-departements-37.csv.gz »). */
function fileNameFromUrl(url: string): string {
  return new URL(url).pathname.split('/').filter(Boolean).slice(-3).join('-');
}

/**
 * Source au format « fichiers » : chaque adresse est enregistrée telle quelle (sans conversion) dans
 * data/raw/<id>/. Tout est téléchargé avant d'écrire, puis le dossier est vidé : jamais de fichier périmé.
 */
async function downloadFiles(source: Source): Promise<void> {
  const files: { name: string; content: Uint8Array }[] = [];
  for (const url of await resolveUrls(source)) {
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`HTTP ${response.status} pour ${url}`);
    files.push({ name: fileNameFromUrl(url), content: new Uint8Array(await response.arrayBuffer()) });
  }
  if (files.length === 0) throw new Error('aucun fichier à télécharger');
  const dir = path.join(RAW_DIR, source.id);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  for (const file of files) await writeFile(path.join(dir, file.name), file.content);
}

async function download(source: Source): Promise<void> {
  if (source.format === 'fichiers') {
    await downloadFiles(source);
    return;
  }
  await writeFile(path.join(RAW_DIR, `${source.id}.json`), await fetchJson(source));
}

/** Télécharge une source, avec jusqu'à 3 tentatives espacées (2 s, puis 4 s) en cas de panne passagère. */
async function downloadSource(source: Source): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await download(source);
      console.log(`↓ ${source.id} — ${source.description}`);
      return;
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error);
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(`Source « ${source.id} » indisponible après ${MAX_ATTEMPTS} essais (${reason})`);
      }
      console.warn(`… ${source.id} : essai ${attempt} raté (${reason}), nouvel essai`);
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
}

async function exportQuery(connection: DuckDBConnection, file: string): Promise<void> {
  const name = path.basename(file, '.sql');
  const sql = await readFile(path.join(SQL_DIR, file), 'utf8');
  const rows = (await connection.runAndReadAll(sql)).getRowObjectsJson();
  if (rows.length === 0) throw new Error(`La requête ${file} n'a renvoyé aucune ligne.`);
  await writeFile(path.join(OUTPUT_DIR, `${name}.json`), `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`✓ ${file} → ${rows.length} ligne(s)`);
}

async function runQueries(): Promise<void> {
  const sqlFiles = (await readdir(SQL_DIR)).filter((file) => file.endsWith('.sql')).sort();
  const sharedFiles = sqlFiles.filter((file) => file.startsWith('_'));
  const exportFiles = sqlFiles.filter((file) => !file.startsWith('_'));
  const instance = await DuckDBInstance.create(':memory:');
  const connection = await instance.connect();

  try {
    // Les ventes DVF téléchargées sont d'abord versées dans l'archive du dépôt (data/archive/dvf/), que lit _dvf.sql.
    await archiverDvf(connection);
    for (const file of sharedFiles) {
      await connection.run(await readFile(path.join(SQL_DIR, file), 'utf8'));
      console.log(`✓ ${file} (vues partagées)`);
    }
    for (const file of exportFiles) await exportQuery(connection, file);
  } finally {
    connection.closeSync();
    instance.closeSync();
  }
}

async function main(): Promise<void> {
  await mkdir(RAW_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
  // Une source après l'autre : plus doux pour les API publiques (INSEE notamment).
  // En développement, `npm run data -- --sources=id1,id2` ne retélécharge que ces sources (les autres
  // fichiers de data/raw/ sont réutilisés tels quels) ; la construction officielle télécharge tout.
  const only = process.argv.find((arg) => arg.startsWith('--sources='))?.slice('--sources='.length).split(',');
  for (const source of SOURCES) {
    if (!only || only.includes(source.id)) await downloadSource(source);
  }
  await runQueries();
  await writeFile(
    path.join(OUTPUT_DIR, 'meta.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString() }, null, 2)}\n`,
  );
}

main().catch((error: unknown) => {
  console.error('✗ Échec de la préparation des données :', error instanceof Error ? error.message : error);
  process.exit(1);
});
