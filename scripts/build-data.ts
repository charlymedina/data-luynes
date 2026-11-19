/**
 * Prépare les données du site, en deux étapes :
 *  1. télécharge chaque source listée dans data/sources.ts vers data/raw/<id>.json ;
 *  2. exécute chaque requête data/sql/<nom>.sql avec DuckDB et écrit le résultat
 *     dans src/data/generated/<nom>.json, que les pages du site importent.
 *
 * Règle simple : un fichier .sql = un fichier .json. Chaque requête doit renvoyer au moins une ligne,
 * sinon la construction s'arrête (et le site déjà en ligne reste inchangé).
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DuckDBInstance } from '@duckdb/node-api';
import { SOURCES, type Source } from '../data/sources.ts';

const RAW_DIR = 'data/raw';
const SQL_DIR = 'data/sql';
const OUTPUT_DIR = 'src/data/generated';
const FETCH_TIMEOUT_MS = 30_000;

async function downloadSource(source: Source): Promise<void> {
  const response = await fetch(source.url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`Source « ${source.id} » : HTTP ${response.status} pour ${source.url}`);
  }
  const body = await response.text();
  JSON.parse(body); // échoue tôt si la source ne renvoie pas du JSON valide
  await writeFile(path.join(RAW_DIR, `${source.id}.json`), body);
  console.log(`↓ ${source.id} — ${source.description}`);
}

async function runQueries(): Promise<void> {
  const sqlFiles = (await readdir(SQL_DIR)).filter((file) => file.endsWith('.sql')).sort();
  const instance = await DuckDBInstance.create(':memory:');
  const connection = await instance.connect();

  try {
    for (const file of sqlFiles) {
      const name = path.basename(file, '.sql');
      const sql = await readFile(path.join(SQL_DIR, file), 'utf8');
      const reader = await connection.runAndReadAll(sql);
      const rows = reader.getRowObjectsJson();
      if (rows.length === 0) {
        throw new Error(`La requête ${file} n'a renvoyé aucune ligne.`);
      }
      await writeFile(path.join(OUTPUT_DIR, `${name}.json`), `${JSON.stringify(rows, null, 2)}\n`);
      console.log(`✓ ${file} → ${rows.length} ligne(s)`);
    }
  } finally {
    connection.closeSync();
    instance.closeSync();
  }
}

async function main(): Promise<void> {
  await mkdir(RAW_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
  await Promise.all(SOURCES.map(downloadSource));
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
