/**
 * Test des archives (npm run test:archives) : que se passe-t-il quand une source « oublie » une année ?
 *
 * Le test travaille dans une COPIE du dépôt (dossier temporaire) : data/archive/ et data/raw/ ne sont jamais modifiés,
 * et aucun téléchargement n'a lieu (les réponses de data.gouv.fr et du serveur des élections sont simulées).
 * Il vérifie, pour chaque archive, que :
 *  - rien n'est réécrit quand la source n'a pas bougé (les empreintes des fichiers de l'archive restent identiques) ;
 *  - quand une année disparaît de la source (DVF : fichier absent ; BAAC : année absente de l'API ; élections : serveur
 *    injoignable), l'archive garde l'année, ne réécrit rien d'inutile, et les données générées par le SQL restent
 *    exactement les mêmes (nombre de lignes + empreinte du contenu).
 * Il faut avoir lancé `npm run data` au moins une fois (le test lit data/raw/dvf_37/).
 */
import { createHash } from 'node:crypto';
import { cp, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DuckDBInstance } from '@duckdb/node-api';

const DEPOT = process.cwd();
const verifications: { nom: string; ok: boolean; detail?: string }[] = [];

function verifier(nom: string, ok: boolean, detail?: string): void {
  verifications.push({ nom, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${nom}${!ok && detail ? ` — ${detail}` : ''}`);
}

/** Empreinte (SHA-256) de chaque fichier d'un dossier, par chemin relatif. */
async function empreintes(dossier: string): Promise<Record<string, string>> {
  const resultat: Record<string, string> = {};
  for (const nom of (await readdir(dossier)).sort()) {
    resultat[nom] = createHash('sha256').update(await readFile(path.join(dossier, nom))).digest('hex');
  }
  return resultat;
}

/** Noms des fichiers dont le contenu diffère (ajoutés, supprimés ou modifiés). */
function differences(avant: Record<string, string>, apres: Record<string, string>, ignorer: (nom: string) => boolean = () => false): string[] {
  const noms = new Set([...Object.keys(avant), ...Object.keys(apres)]);
  return [...noms].filter((nom) => !ignorer(nom) && avant[nom] !== apres[nom]).sort();
}

/** Exécute un fichier SQL de vues partagées, puis renvoie le nombre de lignes et l'empreinte de chaque table demandée. */
/**
 * Les tables peuvent être données avec leur requête de lecture : dvf_ventes est calculée avec avg() et any_value(),
 * dont les dernières décimales (lon, lat) et les égalités (rue = mode(), code_commune = any_value()) varient d'une exécution à l'autre, même sans archive.
 */
async function empreinteDonnees(fichierSql: string, tables: Record<string, string> | string[]): Promise<Record<string, string>> {
  const lectures = Array.isArray(tables) ? Object.fromEntries(tables.map((t) => [t, `SELECT * FROM ${t}`])) : tables;
  const instance = await DuckDBInstance.create(':memory:');
  const connection = await instance.connect();
  try {
    await connection.run(await readFile(path.join('data/sql', fichierSql), 'utf8'));
    const resultat: Record<string, string> = {};
    for (const [table, lecture] of Object.entries(lectures)) {
      const [ligne] = (await connection
        .runAndReadAll(`SELECT count(*)::INTEGER AS n, coalesce(bit_xor(hash(t)), 0)::VARCHAR AS h FROM (${lecture}) t`)
        .then((r) => r.getRowObjectsJson())) as unknown as { n: number; h: string }[];
      resultat[table] = `${ligne?.n} lignes, empreinte ${ligne?.h}`;
    }
    return resultat;
  } finally {
    connection.closeSync();
    instance.closeSync();
  }
}

async function nombre(sql: string): Promise<number> {
  const instance = await DuckDBInstance.create(':memory:');
  const connection = await instance.connect();
  try {
    await connection.run(await readFile('data/sql/_dvf.sql', 'utf8'));
    const [ligne] = (await connection.runAndReadAll(sql).then((r) => r.getRowObjectsJson())) as unknown as { n: number }[];
    return Number(ligne?.n);
  } finally {
    connection.closeSync();
    instance.closeSync();
  }
}

/** Remplace fetch pour la durée du test : seules les adresses prévues répondent, tout autre appel fait échouer le test. */
function simulerReseau(reponses: (url: string, methode: string) => Response | undefined | 'panne'): () => void {
  const reel = globalThis.fetch;
  globalThis.fetch = (async (entree: RequestInfo | URL, init?: RequestInit) => {
    const url = String(entree);
    const methode = init?.method ?? 'GET';
    const reponse = reponses(url, methode);
    if (reponse === 'panne') throw new TypeError('fetch failed (panne simulée)');
    if (!reponse) throw new Error(`téléchargement inattendu : ${methode} ${url}`);
    return reponse;
  }) as typeof fetch;
  return () => {
    globalThis.fetch = reel;
  };
}

const TABLES_DVF = {
  dvf_lignes: 'SELECT * FROM dvf_lignes',
  dvf_ventes: 'SELECT * EXCLUDE (code_commune, rue, lon, lat), round(lon, 5) AS lon, round(lat, 5) AS lat FROM dvf_ventes',
};

async function testerDvf(): Promise<void> {
  console.log('\n— DVF (ventes immobilières) —');
  const { archiverDvf } = await import('./archive-dvf.ts');
  const archive = 'data/archive/dvf';
  const connexion = async <T>(action: (c: import('@duckdb/node-api').DuckDBConnection) => Promise<T>): Promise<T> => {
    const instance = await DuckDBInstance.create(':memory:');
    const c = await instance.connect();
    try {
      return await action(c);
    } finally {
      c.closeSync();
      instance.closeSync();
    }
  };
  const fichiers = (await readdir('data/raw/dvf_37')).filter((f) => f.endsWith('.csv.gz')).sort();
  const manifestAvant = JSON.parse(await readFile(`${archive}/manifest.json`, 'utf8')) as Record<string, unknown>;
  const anneesArchivees = Object.keys(manifestAvant);
  // Année la plus ancienne qui est à la fois archivée et encore publiée (sinon, rien à simuler : elle a déjà disparu).
  const disparue = anneesArchivees.sort().find((a) => fichiers.some((f) => f.startsWith(a)));
  if (!disparue) {
    console.log('  DVF : aucune année archivée n\'est encore publiée, scénario sans objet');
    return;
  }

  const avant = await empreintes(archive);
  await connexion((c) => archiverDvf(c));
  verifier('DVF : source inchangée → archive strictement identique (aucune réécriture)', differences(avant, await empreintes(archive)).length === 0, differences(avant, await empreintes(archive)).join(', '));
  const donnees = await empreinteDonnees('_dvf.sql', TABLES_DVF);

  // L'année la plus ancienne disparaît de la source (comme à chaque mise à jour de Géo-DVF).
  await rm(path.join('data/raw/dvf_37', fichiers.find((f) => f.startsWith(disparue)) as string));
  await connexion((c) => archiverDvf(c));
  const apres = await empreintes(archive);
  const touchees = differences(avant, apres, (nom) => nom === 'manifest.json');
  const nouvelles = touchees.filter((nom) => !(nom in avant));
  const reecrites = touchees.filter((nom) => nom in avant);
  verifier(`DVF : année ${disparue} retirée de la source → son archive et celles déjà enregistrées ne sont pas réécrites`, reecrites.length === 0, reecrites.join(', '));
  console.log(`  (attendu : la nouvelle plus ancienne année publiée est ajoutée à l'archive : ${nouvelles.join(', ') || 'aucune'})`);
  const manifestApres = JSON.parse(await readFile(`${archive}/manifest.json`, 'utf8')) as Record<string, unknown>;
  verifier(
    'DVF : les entrées déjà archivées du manifest sont inchangées',
    anneesArchivees.every((a) => JSON.stringify(manifestApres[a]) === JSON.stringify(manifestAvant[a])),
  );
  const ventesDisparue = await nombre(`SELECT count(*)::INTEGER AS n FROM dvf_lignes WHERE year(date_vente) = ${disparue}`);
  verifier(`DVF : les ventes ${disparue} sont toujours lues (depuis l'archive)`, ventesDisparue > 0, `${ventesDisparue} ligne(s)`);
  const donneesApres = await empreinteDonnees('_dvf.sql', TABLES_DVF);
  verifier('DVF : données générées identiques (dvf_lignes et dvf_ventes) malgré la disparition', JSON.stringify(donnees) === JSON.stringify(donneesApres), `${JSON.stringify(donnees)} ≠ ${JSON.stringify(donneesApres)}`);
}

async function testerBaac(): Promise<void> {
  console.log('\n— BAAC (accidents de la route) —');
  const { archiverBaac } = await import('./archive-baac.ts');
  const archive = 'data/archive/baac';
  const manifest = JSON.parse(await readFile(`${archive}/manifest.json`, 'utf8')) as Record<string, Record<string, string>>;
  const annees = Object.keys(manifest).sort();
  const disparue = annees[0] as string;
  const listing = (sans?: string): Response =>
    new Response(JSON.stringify({ resources: annees.filter((a) => a !== sans).flatMap((a) => ['caract', 'usagers', 'vehicules', 'lieux'].map((t) => ({ url: manifest[a]?.[t] }))) }));
  const connexion = async (): Promise<void> => {
    const instance = await DuckDBInstance.create(':memory:');
    const c = await instance.connect();
    try {
      await archiverBaac(c);
    } finally {
      c.closeSync();
      instance.closeSync();
    }
  };
  const tables = ['accidents', 'accidents_usagers_detail', 'accidents_vehicules'];
  const avant = await empreintes(archive);
  const donnees = await empreinteDonnees('_accidents.sql', tables);

  let fin = simulerReseau((url) => (url.includes('/datasets/53698f4ca3a729239d2036df') ? listing() : undefined));
  try {
    await connexion();
  } finally {
    fin();
  }
  verifier('BAAC : source inchangée → archive strictement identique, aucun téléchargement', differences(avant, await empreintes(archive)).length === 0);

  fin = simulerReseau((url) => (url.includes('/datasets/53698f4ca3a729239d2036df') ? listing(disparue) : undefined));
  try {
    await connexion();
  } finally {
    fin();
  }
  const apres = await empreintes(archive);
  verifier(`BAAC : année ${disparue} retirée de data.gouv.fr → archive strictement identique, aucun téléchargement`, differences(avant, apres).length === 0, differences(avant, apres).join(', '));
  verifier(`BAAC : année ${disparue} toujours présente dans l'archive`, existsSync(`${archive}/${disparue}-caract.parquet`) && `${disparue}` in (JSON.parse(await readFile(`${archive}/manifest.json`, 'utf8')) as object));
  const donneesApres = await empreinteDonnees('_accidents.sql', tables);
  verifier('BAAC : données générées identiques malgré la disparition', JSON.stringify(donnees) === JSON.stringify(donneesApres), `${JSON.stringify(donnees)} ≠ ${JSON.stringify(donneesApres)}`);

  fin = simulerReseau(() => 'panne');
  try {
    await connexion();
  } finally {
    fin();
  }
  verifier('BAAC : data.gouv.fr injoignable → archive existante utilisée, rien de réécrit', differences(avant, await empreintes(archive)).length === 0);
}

async function testerElections(): Promise<void> {
  console.log('\n— Élections —');
  const { archiverElections } = await import('./archive-elections.ts');
  const archive = 'data/archive/elections';
  const manifest = JSON.parse(await readFile(`${archive}/manifest.json`, 'utf8')) as Record<string, string>;
  const avant = await empreintes(archive);
  const lancer = async (): Promise<void> => {
    const instance = await DuckDBInstance.create(':memory:');
    const c = await instance.connect();
    try {
      await archiverElections(c);
    } finally {
      c.closeSync();
      instance.closeSync();
    }
  };
  let fin = simulerReseau((url, methode) =>
    methode === 'HEAD' && url.endsWith('general_results.parquet')
      ? new Response(null, { headers: { etag: manifest.general ?? '' } })
      : methode === 'HEAD' && url.endsWith('candidats_results.parquet')
        ? new Response(null, { headers: { etag: manifest.candidats ?? '' } })
        : undefined,
  );
  try {
    await lancer();
  } finally {
    fin();
  }
  verifier('Élections : serveur inchangé (même ETag) → archive identique, aucune extraction', differences(avant, await empreintes(archive)).length === 0);
  fin = simulerReseau(() => 'panne');
  try {
    await lancer();
  } finally {
    fin();
  }
  verifier('Élections : serveur injoignable → archive existante utilisée, rien de réécrit', differences(avant, await empreintes(archive)).length === 0);
}

async function main(): Promise<void> {
  const copie = await mkdtemp(path.join(tmpdir(), 'luynes-archives-'));
  try {
    await cp('data/archive', path.join(copie, 'data/archive'), { recursive: true });
    await cp('data/sql', path.join(copie, 'data/sql'), { recursive: true });
    await cp('data/raw/dvf_37', path.join(copie, 'data/raw/dvf_37'), { recursive: true });
    process.chdir(copie);
    await testerDvf();
    await testerBaac();
    await testerElections();
  } finally {
    process.chdir(DEPOT);
    await rm(copie, { recursive: true, force: true });
  }
  const echecs = verifications.filter((v) => !v.ok);
  console.log(`\n${verifications.length - echecs.length}/${verifications.length} vérifications réussies`);
  if (echecs.length > 0) process.exit(1);
}

main().catch((error: unknown) => {
  console.error('✗ Test des archives impossible :', error instanceof Error ? error.stack : error);
  process.exit(1);
});
