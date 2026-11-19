/**
 * Archive des accidents corporels de la route (BAAC, ONISR) dans le dépôt : data/archive/baac/<année>-<table>.parquet.
 *
 * Pourquoi : chaque année est publiée en 4 gros fichiers nationaux (~25 Mo), soit ~500 Mo pour 2005 → aujourd'hui.
 * Les télécharger à chaque construction serait lent et fragile. On n'en garde donc que l'Indre-et-Loire, harmonisé
 * (les formats ont changé en 2019), et on ne retélécharge une année que si sa publication a changé sur data.gouv.fr.
 *
 * Étapes, pour chaque année :
 *  1. la liste des fichiers vient de l'API data.gouv (les adresses changent à chaque publication) ;
 *  2. si l'archive contient déjà cette année avec les mêmes adresses (manifest.json), rien à faire ;
 *  3. sinon, les 4 fichiers sont téléchargés dans data/raw/baac/, convertis en UTF-8 (les anciens sont en Windows-1252),
 *     puis harmonisés par les requêtes data/sql/baac/*.sql et enregistrés en Parquet.
 * Si data.gouv.fr est injoignable, la construction continue avec l'archive existante.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { DuckDBConnection } from '@duckdb/node-api';

const DATASET = 'https://www.data.gouv.fr/api/1/datasets/53698f4ca3a729239d2036df/';
const RAW_DIR = 'data/raw/baac';
const ARCHIVE_DIR = 'data/archive/baac';
const SQL_DIR = 'data/sql/baac';
const MANIFEST = path.join(ARCHIVE_DIR, 'manifest.json');
const TABLES = ['caract', 'usagers', 'vehicules', 'lieux'] as const;
type Table = (typeof TABLES)[number];
type Annee = Record<Table, string>;
type Manifest = Record<string, Annee>;
const TIMEOUT_MS = 120_000;

/** « caracteristiques_2016.csv », « carcteristiques-2022.csv », « Caract_2024.csv » → { table, année }. */
function classer(url: string): { table: Table; annee: string } | null {
  const nom = path.basename(new URL(url).pathname).toLowerCase();
  const m = /^(caract|caracteristiques|carcteristiques|usagers|vehicules|lieux)[-_](\d{4})\.csv$/.exec(nom);
  if (!m?.[1] || !m[2]) return null;
  const table = (m[1].startsWith('ca') ? 'caract' : m[1]) as Table;
  return { table, annee: m[2] };
}

async function anneesPubliees(): Promise<Manifest> {
  const response = await fetch(DATASET, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`API data.gouv : HTTP ${response.status}`);
  const { resources } = (await response.json()) as { resources: { url: string }[] };
  const parAnnee: Record<string, Partial<Annee>> = {};
  for (const { url } of resources) {
    const c = classer(url);
    if (c) parAnnee[c.annee] = { ...parAnnee[c.annee], [c.table]: url };
  }
  const completes = Object.entries(parAnnee).filter(([, t]) => TABLES.every((table) => t[table]));
  return Object.fromEntries(completes) as Manifest;
}

/** Télécharge un fichier et le réécrit en UTF-8 avec des fins de ligne simples ; renvoie le séparateur détecté. */
async function telecharger(url: string, destination: string): Promise<string> {
  for (let essai = 1; ; essai++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const octets = new Uint8Array(await response.arrayBuffer());
      let texte: string;
      try {
        texte = new TextDecoder('utf-8', { fatal: true }).decode(octets);
      } catch {
        texte = new TextDecoder('windows-1252').decode(octets);
      }
      texte = texte.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
      // En-tête harmonisé : le fichier 2022 appelle « Accident_Id » la colonne Num_Acc des autres années.
      const fin = texte.indexOf('\n');
      const entete = texte.slice(0, fin).replace(/"?Accident_Id"?/, 'Num_Acc');
      await writeFile(destination, entete + texte.slice(fin));
      const compte = (c: string): number => entete.split(c).length;
      return [';', '\t', ','].reduce((a, b) => (compte(b) > compte(a) ? b : a));
    } catch (error: unknown) {
      if (essai === 3) throw new Error(`${url} : ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

async function requete(table: Table, fichier: string, sep: string, annee: string): Promise<string> {
  const sql = await readFile(path.join(SQL_DIR, `${table}.sql`), 'utf8');
  return sql
    .replaceAll('{fichier}', fichier)
    .replaceAll('{sep}', sep === '\t' ? '\\t' : sep)
    .replaceAll('{annee}', annee)
    .trim()
    .replace(/;\s*$/, '');
}

async function archiverAnnee(connection: DuckDBConnection, annee: string, urls: Annee): Promise<void> {
  const dossier = path.join(RAW_DIR, annee);
  await mkdir(dossier, { recursive: true });
  for (const table of TABLES) {
    const fichier = path.join(dossier, `${table}.csv`);
    const sep = await telecharger(urls[table], fichier);
    const selection = await requete(table, fichier, sep, annee);
    if (table === 'caract') await connection.run(`CREATE OR REPLACE TEMP TABLE accidents_annee AS ${selection}`);
    const source = table === 'caract' ? 'SELECT * FROM accidents_annee' : selection;
    await connection.run(`COPY (${source}) TO '${path.join(ARCHIVE_DIR, `${annee}-${table}.parquet`)}' (FORMAT parquet, COMPRESSION zstd)`);
  }
  await rm(dossier, { recursive: true, force: true });
  console.log(`↻ Accidents ${annee} : archivés`);
}

function aJour(ancien: Annee | undefined, nouveau: Annee, annee: string): boolean {
  if (!ancien) return false;
  const fichiersPresents = TABLES.every((t) => existsSync(path.join(ARCHIVE_DIR, `${annee}-${t}.parquet`)));
  return fichiersPresents && TABLES.every((t) => ancien[t] === nouveau[t]);
}

async function lireManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8')) as Manifest;
  } catch {
    return {};
  }
}

export async function archiverBaac(connection: DuckDBConnection): Promise<void> {
  await mkdir(ARCHIVE_DIR, { recursive: true });
  const manifest = await lireManifest();
  let publiees: Manifest;
  try {
    publiees = await anneesPubliees();
  } catch (error: unknown) {
    if (Object.keys(manifest).length === 0) throw error;
    console.warn(`… accidents : data.gouv.fr injoignable, archive existante utilisée (${error instanceof Error ? error.message : error})`);
    return;
  }
  for (const [annee, urls] of Object.entries(publiees).sort(([a], [b]) => a.localeCompare(b))) {
    if (aJour(manifest[annee], urls, annee)) continue;
    await archiverAnnee(connection, annee, urls);
    manifest[annee] = urls;
    await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  console.log(`= Accidents : ${Object.keys(manifest).length} années dans l'archive`);
}
