/**
 * Outils communs aux scripts d'archive (scripts/archive-*.ts) : lecture des manifest.json et empreinte
 * des requêtes SQL d'extraction (pour refaire une archive quand Charly modifie une de ces requêtes).
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, rename } from 'node:fs/promises';
import path from 'node:path';
import type { DuckDBConnection } from '@duckdb/node-api';

/** Lit un manifest.json ; renvoie `vide` s'il n'existe pas encore (première archive). */
export async function lireManifest<T>(fichier: string, vide: T): Promise<T> {
  try {
    return JSON.parse(await readFile(fichier, 'utf8')) as T;
  } catch {
    return vide;
  }
}

/** Empreinte courte (12 caractères) du contenu de tous les fichiers .sql d'un dossier, dans l'ordre alphabétique. */
export async function empreinteSql(dossier: string): Promise<string> {
  const fichiers = (await readdir(dossier)).filter((f) => f.endsWith('.sql')).sort();
  const hash = createHash('sha256');
  for (const f of fichiers) hash.update(`${f}\n${await readFile(path.join(dossier, f), 'utf8')}\n`);
  return hash.digest('hex').slice(0, 12);
}

/**
 * Enregistre le résultat d'une requête en Parquet compressé, d'abord dans un fichier « .tmp » puis renommé :
 * une construction interrompue en plein milieu ne laisse jamais un fichier d'archive à moitié écrit (que l'étape
 * « Enregistrer les archives » du workflow aurait pu enregistrer dans le dépôt).
 */
export async function copierVersParquet(connection: DuckDBConnection, selection: string, cible: string): Promise<void> {
  await connection.run(`COPY (${selection}) TO '${cible}.tmp' (FORMAT parquet, COMPRESSION zstd)`);
  await rename(`${cible}.tmp`, cible);
}
