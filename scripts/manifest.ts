/**
 * Outils communs aux scripts d'archive (scripts/archive-*.ts) : lecture des manifest.json et empreinte
 * des requêtes SQL d'extraction (pour refaire une archive quand Charly modifie une de ces requêtes).
 */
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

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
