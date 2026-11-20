/**
 * Archive des ventes immobilières (DVF) dans le dépôt : data/archive/dvf/<année>.parquet.
 *
 * Pourquoi : les fichiers Géo-DVF ne couvrent que ~5 années glissantes ; à chaque mise à jour (printemps,
 * automne), la plus ancienne peut disparaître. L'archive garde les années que la source ne publie plus.
 *
 * Règles (pour garder un dépôt léger) :
 *  - on archive les ANNÉES_A_SAUVER années publiées les plus anciennes : ce sont celles qui vont disparaître,
 *    et DVF ne les révise plus guère. Le fichier n'est réécrit que si son contenu a changé (empreinte dans manifest.json) ;
 *  - une année qui a disparu de la source reste dans l'archive telle quelle, pour toujours ;
 *  - data/sql/_dvf.sql lit les fichiers publiés + les années archivées qui ne sont plus publiées : aucun doublon.
 * Seules les colonnes utiles et les ventes (y compris sur plan) sont gardées, compressées : ~0,8 Mo par année.
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { DuckDBConnection } from '@duckdb/node-api';
import { lireManifest } from './manifest.ts';

const RAW_DIR = 'data/raw/dvf_37';
const ARCHIVE_DIR = 'data/archive/dvf';
const MANIFEST = path.join(ARCHIVE_DIR, 'manifest.json');
/** Deux années plutôt qu'une : si une mise à jour en retire deux d'un coup, aucune n'est perdue. */
const ANNEES_A_SAUVER = 2;

/** Colonnes de DVF utilisées par data/sql/_dvf.sql (toutes gardées en texte, comme à la lecture du CSV). */
export const COLONNES_DVF = [
  'id_mutation',
  'date_mutation',
  'nature_mutation',
  'valeur_fonciere',
  'code_commune',
  'adresse_nom_voie',
  'id_parcelle',
  'lot1_numero',
  'type_local',
  'surface_reelle_bati',
  'nombre_pieces_principales',
  'nature_culture',
  'surface_terrain',
  'longitude',
  'latitude',
] as const;

interface EntreeManifest {
  lignes: number;
  empreinte: string;
  mis_a_jour: string;
}
type Manifest = Record<string, EntreeManifest>;

/** Requête des lignes à archiver pour un fichier annuel (ventes classiques et sur plan uniquement). */
function selectionAnnee(fichier: string): string {
  return `SELECT ${COLONNES_DVF.join(', ')}
    FROM read_csv('${fichier}', all_varchar = true)
    WHERE nature_mutation IN ('Vente', 'Vente en l''état futur d''achèvement')`;
}

/** Empreinte indépendante de l'ordre des lignes : nombre de lignes + « ou exclusif » des hachages de chaque ligne. */
async function empreinte(connection: DuckDBConnection, selection: string): Promise<EntreeManifest> {
  const reader = await connection.runAndReadAll(
    `SELECT count(*)::INTEGER AS lignes, coalesce(bit_xor(hash(${COLONNES_DVF.join(', ')})), 0)::VARCHAR AS empreinte FROM (${selection})`,
  );
  const [row] = reader.getRowObjectsJson() as unknown as { lignes: number; empreinte: string }[];
  if (!row) throw new Error('empreinte DVF introuvable');
  return { lignes: row.lignes, empreinte: row.empreinte, mis_a_jour: new Date().toISOString().slice(0, 10) };
}

async function archiverAnnee(connection: DuckDBConnection, manifest: Manifest, fichier: string): Promise<void> {
  const annee = fichier.slice(0, 4);
  const selection = selectionAnnee(path.join(RAW_DIR, fichier));
  const nouvelle = await empreinte(connection, selection);
  const ancienne = manifest[annee];
  if (ancienne && ancienne.empreinte === nouvelle.empreinte && ancienne.lignes === nouvelle.lignes) {
    console.log(`= DVF ${annee} : archive à jour`);
    return;
  }
  await connection.run(`COPY (${selection} ORDER BY id_mutation, id_parcelle, lot1_numero)
    TO '${path.join(ARCHIVE_DIR, `${annee}.parquet`)}' (FORMAT parquet, COMPRESSION zstd)`);
  manifest[annee] = nouvelle;
  console.log(`↻ DVF ${annee} : archivée (${nouvelle.lignes} lignes)`);
}

export async function archiverDvf(connection: DuckDBConnection): Promise<void> {
  await mkdir(ARCHIVE_DIR, { recursive: true });
  const manifest = await lireManifest<Manifest>(MANIFEST, {});
  const fichiers = (await readdir(RAW_DIR).catch(() => [])).filter((f) => /^\d{4}-.*\.csv\.gz$/.test(f)).sort();
  if (fichiers.length === 0) throw new Error(`aucun fichier DVF dans ${RAW_DIR}`);

  for (const fichier of fichiers.slice(0, ANNEES_A_SAUVER)) await archiverAnnee(connection, manifest, fichier);

  const publiees = new Set(fichiers.map((f) => f.slice(0, 4)));
  for (const annee of Object.keys(manifest).filter((a) => !publiees.has(a))) {
    console.log(`📦 DVF ${annee} : n'est plus publiée, lue depuis l'archive`);
  }
  const trie = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(MANIFEST, `${JSON.stringify(trie, null, 2)}\n`);
}
