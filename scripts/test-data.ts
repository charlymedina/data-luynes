/**
 * Tests de cohérence des données (npm run test:data), écrits en SQL lisible dans data/tests/*.sql.
 * Chaque fichier src/data/generated/<nom>.json devient une table <nom> ; chaque test renvoie les lignes
 * en anomalie (colonne « probleme ») : zéro ligne = test réussi. Le moindre problème fait échouer la commande
 * (et donc la publication en CI : le site en ligne reste inchangé).
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { DuckDBInstance } from '@duckdb/node-api';

const GENERATED_DIR = 'src/data/generated';
const TESTS_DIR = 'data/tests';

async function main(): Promise<void> {
  const instance = await DuckDBInstance.create(':memory:');
  const connection = await instance.connect();
  const echecs: string[] = [];
  try {
    const jsons = (await readdir(GENERATED_DIR)).filter((f) => f.endsWith('.json') && f !== 'meta.json');
    if (jsons.length === 0) throw new Error(`aucune donnée dans ${GENERATED_DIR} : lancer « npm run data » d'abord`);
    for (const fichier of jsons) {
      const table = path.basename(fichier, '.json');
      await connection.run(`CREATE VIEW ${table} AS SELECT * FROM read_json('${path.join(GENERATED_DIR, fichier)}')`);
    }

    const tests = (await readdir(TESTS_DIR)).filter((f) => f.endsWith('.sql')).sort();
    for (const test of tests) {
      const sql = await readFile(path.join(TESTS_DIR, test), 'utf8');
      const lignes = (await connection.runAndReadAll(sql)).getRowObjectsJson() as { probleme?: unknown }[];
      if (lignes.length === 0) {
        console.log(`✓ ${test}`);
        continue;
      }
      console.error(`✗ ${test}`);
      for (const ligne of lignes) echecs.push(`${test} : ${String(ligne.probleme ?? JSON.stringify(ligne))}`);
    }
  } finally {
    connection.closeSync();
    instance.closeSync();
  }

  if (echecs.length > 0) {
    console.error(`\n${echecs.length} problème(s) dans les données :`);
    for (const echec of echecs) console.error(`  - ${echec}`);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error('✗ Tests des données impossibles :', error instanceof Error ? error.message : error);
  process.exit(1);
});
