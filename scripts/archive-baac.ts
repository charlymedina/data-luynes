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
 *
 * Garde-fous :
 *  - au plus 3 années retéléchargées par construction (si data.gouv change toutes les adresses d'un coup,
 *    l'archive se met à jour en quelques semaines au lieu de faire échouer chaque construction) ;
 *  - une modification des requêtes data/sql/baac/*.sql refait l'archive (empreinte « sql » du manifest).
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { DuckDBConnection } from '@duckdb/node-api';
import { copierVersParquet, empreinteSql, lireManifest } from './manifest.ts';

const DATASET = 'https://www.data.gouv.fr/api/1/datasets/53698f4ca3a729239d2036df/';
const RAW_DIR = 'data/raw/baac';
const ARCHIVE_DIR = 'data/archive/baac';
const SQL_DIR = 'data/sql/baac';
const MANIFEST = path.join(ARCHIVE_DIR, 'manifest.json');
const TABLES = ['caract', 'usagers', 'vehicules', 'lieux'] as const;
type Table = (typeof TABLES)[number];
type Annee = Record<Table, string>;
/** Ce qui est noté pour chaque année archivée : les adresses des 4 fichiers + l'empreinte des requêtes utilisées. */
type AnneeArchivee = Annee & { sql?: string };
type Manifest = Record<string, AnneeArchivee>;
const TIMEOUT_MS = 120_000;
/** Réglable pour un rattrapage complet en local : BAAC_MAX_ANNEES=30 npm run data. */
const MAX_ANNEES_PAR_CONSTRUCTION = Number(process.env.BAAC_MAX_ANNEES ?? 3);
const PAUSE_ENTRE_ESSAIS_MS = 5_000;

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

/**
 * Colonnes qui n'existent que dans certains formats (ex. « vma » et « secu1 » depuis 2019, « secu » avant).
 * Celles absentes d'un fichier sont ajoutées vides, pour que les requêtes data/sql/baac/*.sql marchent sur toutes les années.
 */
const COLONNES_FACULTATIVES = ['vma', 'surf', 'secu', 'secu1', 'secu2', 'secu3', 'sexe', 'an_nais', 'col', 'int', 'jour', 'hrmn', 'place', 'obsm', 'manv', 'catr', 'voie'];

interface FichierTelecharge {
  sep: string;
  colonnes: string[];
}

/** Télécharge un fichier et le réécrit en UTF-8 avec des fins de ligne simples ; renvoie le séparateur et les colonnes. */
async function telecharger(url: string, destination: string): Promise<FichierTelecharge> {
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
      const sep = [';', '\t', ','].reduce((a, b) => (compte(b) > compte(a) ? b : a));
      const colonnes = entete.split(sep).map((c) => c.replaceAll('"', '').trim());
      return { sep, colonnes };
    } catch (error: unknown) {
      if (essai === 3) throw new Error(`${url} : ${error instanceof Error ? error.message : String(error)}`);
      await sleep(PAUSE_ENTRE_ESSAIS_MS * essai);
    }
  }
}

async function requete(table: Table, annee: string): Promise<string> {
  const sql = await readFile(path.join(SQL_DIR, `${table}.sql`), 'utf8');
  return sql
    .replaceAll('{annee}', annee)
    .trim()
    .replace(/;\s*$/, '');
}

/** Vue « brut » sur le fichier téléchargé, complétée des colonnes facultatives absentes (vides). */
async function creerVueBrut(connection: DuckDBConnection, fichier: string, { sep, colonnes }: FichierTelecharge): Promise<void> {
  const presentes = new Set(colonnes.map((c) => c.toLowerCase()));
  const manquantes = COLONNES_FACULTATIVES.filter((c) => !presentes.has(c)).map((c) => `, NULL::VARCHAR AS "${c}"`).join('');
  const delim = sep === '\t' ? '\\t' : sep;
  await connection.run(`CREATE OR REPLACE TEMP VIEW brut AS SELECT *${manquantes} FROM read_csv('${fichier}', delim = '${delim}', all_varchar = true, header = true)`);
}

async function archiverAnnee(connection: DuckDBConnection, annee: string, urls: Annee): Promise<void> {
  const dossier = path.join(RAW_DIR, annee);
  await mkdir(dossier, { recursive: true });
  for (const table of TABLES) {
    const fichier = path.join(dossier, `${table}.csv`);
    await creerVueBrut(connection, fichier, await telecharger(urls[table], fichier));
    const selection = await requete(table, annee);
    if (table === 'caract') await connection.run(`CREATE OR REPLACE TEMP TABLE accidents_annee AS ${selection}`);
    const source = table === 'caract' ? 'SELECT * FROM accidents_annee' : selection;
    await copierVersParquet(connection, source, path.join(ARCHIVE_DIR, `${annee}-${table}.parquet`));
  }
  await rm(dossier, { recursive: true, force: true });
  console.log(`↻ Accidents ${annee} : archivés`);
}

function aJour(ancien: AnneeArchivee | undefined, nouveau: Annee, annee: string, sql: string): boolean {
  if (!ancien) return false;
  const fichiersPresents = TABLES.every((t) => existsSync(path.join(ARCHIVE_DIR, `${annee}-${t}.parquet`)));
  return fichiersPresents && ancien.sql === sql && TABLES.every((t) => ancien[t] === nouveau[t]);
}

export async function archiverBaac(connection: DuckDBConnection): Promise<void> {
  await mkdir(ARCHIVE_DIR, { recursive: true });
  const manifest = await lireManifest<Manifest>(MANIFEST, {});
  const sql = await empreinteSql(SQL_DIR);
  // Archives faites avant l'ajout de l'empreinte : elles ont été produites par les requêtes actuelles.
  for (const archivee of Object.values(manifest)) archivee.sql ??= sql;
  let publiees: Record<string, Annee>;
  try {
    publiees = await anneesPubliees();
  } catch (error: unknown) {
    if (Object.keys(manifest).length === 0) throw error;
    console.warn(`… accidents : data.gouv.fr injoignable, archive existante utilisée (${error instanceof Error ? error.message : error})`);
    return;
  }
  const aRefaire = Object.entries(publiees)
    .sort(([a], [b]) => b.localeCompare(a)) // les années récentes d'abord
    .filter(([annee, urls]) => !aJour(manifest[annee], urls, annee, sql));
  for (const [annee, urls] of aRefaire.slice(0, MAX_ANNEES_PAR_CONSTRUCTION)) {
    await archiverAnnee(connection, annee, urls);
    manifest[annee] = { ...urls, sql };
    await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  if (aRefaire.length > MAX_ANNEES_PAR_CONSTRUCTION) {
    console.warn(`… accidents : ${aRefaire.length - MAX_ANNEES_PAR_CONSTRUCTION} années restent à mettre à jour (prochaines constructions)`);
  }
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`= Accidents : ${Object.keys(manifest).length} années dans l'archive`);
}
