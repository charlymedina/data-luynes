/**
 * Prépare les données du site, en deux étapes :
 *  1. télécharge chaque source listée dans data/sources.ts vers data/raw/<id>.json ;
 *  2. exécute les requêtes de data/sql/ avec DuckDB :
 *     - les fichiers qui commencent par « _ » (ex. _melodi.sql) sont exécutés en premier : ils préparent
 *       des vues partagées par plusieurs requêtes et ne produisent pas de fichier ;
 *     - chaque autre fichier <nom>.sql produit src/data/generated/<nom>.json, que les pages importent.
 *
 * Règle simple : un fichier .sql = un fichier .json. Chaque requête doit renvoyer au moins une ligne,
 * sinon la construction s'arrête (et le site déjà en ligne reste inchangé).
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { DuckDBInstance, type DuckDBConnection } from '@duckdb/node-api';
import { SOURCES, type Source } from '../data/sources.ts';

const RAW_DIR = 'data/raw';
const SQL_DIR = 'data/sql';
const OUTPUT_DIR = 'src/data/generated';
const FETCH_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2_000;

async function fetchJson(source: Source): Promise<string> {
  const response = await fetch(source.url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.text();
  JSON.parse(body); // échoue tôt si la source ne renvoie pas du JSON valide
  return body;
}

/** Télécharge une source, avec jusqu'à 3 tentatives espacées (2 s, puis 4 s) en cas de panne passagère. */
async function downloadSource(source: Source): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const body = await fetchJson(source);
      await writeFile(path.join(RAW_DIR, `${source.id}.json`), body);
      console.log(`↓ ${source.id} — ${source.description}`);
      return;
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error);
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(`Source « ${source.id} » indisponible après ${MAX_ATTEMPTS} essais (${reason}) : ${source.url}`);
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
  for (const source of SOURCES) await downloadSource(source);
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
