/**
 * Veille mensuelle des nouvelles données ouvertes utiles pour Luynes (37139) — sans aucun coût d'IA.
 *
 * Interroge des API publiques sans clé (data.gouv.fr, Opendatasoft de Tours Métropole et de la Région Centre-Val de Loire),
 * ne garde que ce qui n'est pas déjà connu et ouvre une issue GitHub « Veille données — <mois année> » (étiquette « veille »).
 *
 * Usage :
 *   npx tsx scripts/veille.ts --dry-run          affiche l'issue qui serait ouverte, sans rien publier
 *   npx tsx scripts/veille.ts                    ouvre (ou complète) l'issue du mois avec `gh` (GH_TOKEN requis)
 *   npx tsx scripts/veille.ts --init             marque TOUT ce qui est trouvé aujourd'hui comme connu (data/veille/connus.json)
 *   --connus=<fichier>                           utilise un autre fichier de « connus » (essais)
 *   --sans-issues                                n'interroge pas les issues déjà ouvertes (essais hors GitHub)
 *
 * Un jeu est « connu » s'il est dans data/veille/connus.json, cité dans data/sources*.ts ou dans docs/catalogue-donnees*.md
 * (identifiant ou nom court), ou déjà signalé dans une issue « veille » précédente (marqueurs HTML cachés).
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

// ───────────────────────── Paramètres ─────────────────────────
const CODE_INSEE = '37139';
const COMMUNE_ZONE = `fr:commune:${CODE_INSEE}`;
const EPCI_ZONE = 'fr:epci:243700754'; // Tours Métropole Val de Loire
const DEPARTEMENT_ZONE = 'fr:departement:37';
const FICHIER_CONNUS = 'data/veille/connus.json';
const ETIQUETTE = 'veille';
const TIMEOUT_MS = 30_000;
const ESSAIS = 3;
const PAUSE_ESSAI_MS = 2_000;
const TAILLE_PAGE_GOUV = 100;
const PAGES_GOUV_MAX = 10; // 1 000 jeux par recherche au plus
const TAILLE_PAGE_ODS = 100;
const PAGES_ODS_MAX = 30;
/** Granularités data.gouv considérées comme « communales » (jeux utilisables à l'échelle de Luynes). */
const GRANULARITES_COMMUNALES = new Set(['fr:commune', 'fr:iris', 'fr:canton']);
const MOTS_COMMUNE = /insee|commune|code_com|com_code|codgeo|depcom/i;
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const DATAGOUV = 'https://www.data.gouv.fr/api/1';
const PORTAILS_ODS = [
  { id: 'tours', nom: 'Tours Métropole', hote: 'https://data.tours-metropole.fr', regle: 'metropole' },
  { id: 'cvl', nom: 'Région Centre-Val de Loire', hote: 'https://data.centrevaldeloire.fr', regle: 'region' },
] as const;

// ───────────────────────── Types ─────────────────────────
interface Trouvaille {
  /** Jeton unique : `gouv:<id>` ou `ods:<portail>:<id>`. */
  jeton: string;
  /** Jeton « modifié » (`<jeton>@<date>`), seulement pour les jeux très pertinents. */
  jetonMaj?: string;
  /** Chaînes dont la présence dans les sources/catalogues prouve que le jeu est déjà connu. */
  identifiants: string[];
  titre: string;
  producteur: string;
  lien: string;
  date: string;
  creeLe?: string;
  raisons: string[];
}

interface ResultatSource {
  nom: string;
  trouvailles: Trouvaille[];
  erreur?: string;
}

type Json = Record<string, unknown>;

// ───────────────────────── Réseau robuste ─────────────────────────
const attendre = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** GET JSON avec délai d'attente et 3 essais. */
async function lireJson(url: string): Promise<Json> {
  let derniere: unknown;
  for (let essai = 1; essai <= ESSAIS; essai++) {
    try {
      const reponse = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: 'application/json' } });
      if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
      return (await reponse.json()) as Json;
    } catch (erreur) {
      derniere = erreur;
      if (essai < ESSAIS) await attendre(PAUSE_ESSAI_MS * essai);
    }
  }
  throw new Error(`${url} : ${derniere instanceof Error ? derniere.message : String(derniere)}`);
}

const texte = (v: unknown): string => (typeof v === 'string' ? v : '');
const dateCourte = (v: unknown): string => texte(v).slice(0, 10);

// ───────────────────────── data.gouv.fr ─────────────────────────
interface RechercheGouv {
  /** Étiquette lisible dans l'issue. */
  nom: string;
  parametres: string;
  /** Très pertinent : les mises à jour sont aussi signalées. */
  forte: boolean;
  /** Règle de filtre appliquée à chaque jeu. */
  garder: (jeu: Json) => string | null;
}

const spatial = (jeu: Json): { zones: string[]; granularite: string } => {
  const s = (jeu.spatial ?? {}) as { zones?: unknown; granularity?: unknown };
  return { zones: Array.isArray(s.zones) ? (s.zones as string[]) : [], granularite: texte(s.granularity) };
};

const RECHERCHES_GOUV: RechercheGouv[] = [
  {
    nom: 'data.gouv.fr — mention « Luynes »',
    parametres: 'q=Luynes',
    forte: true,
    // On exclut les homonymes évidents (Luynes en Provence…) quand la zone du jeu est ailleurs.
    garder: (jeu) => {
      const { zones } = spatial(jeu);
      const horsZone = zones.length > 0 && zones.every((z) => z.startsWith('fr:commune:') && z !== COMMUNE_ZONE);
      return horsZone ? null : 'mot-clé « Luynes »';
    },
  },
  {
    nom: 'data.gouv.fr — zone « commune de Luynes »',
    parametres: `geozone=${encodeURIComponent(COMMUNE_ZONE)}`,
    forte: true,
    garder: () => `zone géographique ${COMMUNE_ZONE}`,
  },
  {
    nom: 'data.gouv.fr — Tours Métropole, granularité communale',
    parametres: `geozone=${encodeURIComponent(EPCI_ZONE)}&granularity=fr:commune`,
    forte: false,
    garder: () => `zone ${EPCI_ZONE} (Tours Métropole) + granularité communale`,
  },
  {
    nom: 'data.gouv.fr — mention « Tours Métropole », granularité communale',
    parametres: 'q=Tours%20M%C3%A9tropole&granularity=fr:commune',
    forte: false,
    garder: () => 'mot-clé « Tours Métropole » + granularité communale',
  },
  {
    nom: 'data.gouv.fr — Indre-et-Loire, granularité communale',
    parametres: `geozone=${encodeURIComponent(DEPARTEMENT_ZONE)}&granularity=fr:commune`,
    forte: false,
    garder: () => `zone ${DEPARTEMENT_ZONE} (Indre-et-Loire) + granularité communale`,
  },
  {
    nom: 'data.gouv.fr — mention « Indre-et-Loire », granularité communale',
    parametres: 'q=Indre-et-Loire&granularity=fr:commune',
    forte: false,
    garder: (jeu) => (GRANULARITES_COMMUNALES.has(spatial(jeu).granularite) ? 'mot-clé « Indre-et-Loire » + granularité communale' : null),
  },
];

/** Écarte le bruit : jeux archivés, sans ressource, ou sans fichier exploitable. */
function estExploitable(jeu: Json): boolean {
  if (jeu.archived) return false;
  const ressources = jeu.resources as { total?: number } | undefined;
  return (ressources?.total ?? 1) > 0;
}

function trouvailleGouv(jeu: Json, recherche: RechercheGouv, raison: string): Trouvaille {
  const id = texte(jeu.id);
  const maj = texte(jeu.last_update) || texte(jeu.last_modified);
  const jeton = `gouv:${id}`;
  return {
    jeton,
    jetonMaj: recherche.forte ? `${jeton}@${dateCourte(maj)}` : undefined,
    identifiants: [id, texte(jeu.slug)],
    titre: texte(jeu.title),
    producteur: texte((jeu.organization as Json | null)?.name) || 'producteur non renseigné',
    lien: texte(jeu.page) || `https://www.data.gouv.fr/datasets/${id}`,
    date: dateCourte(maj),
    creeLe: dateCourte(jeu.created_at),
    raisons: [raison],
  };
}

async function chercherGouv(recherche: RechercheGouv): Promise<Trouvaille[]> {
  const trouvees: Trouvaille[] = [];
  for (let page = 1; page <= PAGES_GOUV_MAX; page++) {
    const url = `${DATAGOUV}/datasets/?${recherche.parametres}&sort=-last_update&page_size=${TAILLE_PAGE_GOUV}&page=${page}`;
    const reponse = await lireJson(url);
    const jeux = (reponse.data as Json[] | undefined) ?? [];
    for (const jeu of jeux) {
      const raison = estExploitable(jeu) ? recherche.garder(jeu) : null;
      if (raison) trouvees.push(trouvailleGouv(jeu, recherche, raison));
    }
    if (!reponse.next_page) break;
  }
  return trouvees;
}

async function chercherDataservices(): Promise<Trouvaille[]> {
  const trouvees: Trouvaille[] = [];
  const termes = ['Luynes', 'Tours Métropole', 'Indre-et-Loire'];
  for (const terme of termes) {
    const reponse = await lireJson(`${DATAGOUV}/dataservices/?q=${encodeURIComponent(terme)}&sort=-created&page_size=${TAILLE_PAGE_GOUV}`);
    for (const api of (reponse.data as Json[] | undefined) ?? []) {
      const id = texte(api.id);
      trouvees.push({
        jeton: `api:${id}`,
        identifiants: [id, texte(api.slug)],
        titre: `[API] ${texte(api.title)}`,
        producteur: texte((api.organization as Json | null)?.name) || 'producteur non renseigné',
        lien: texte(api.self_web_url) || `https://www.data.gouv.fr/dataservices/${id}`,
        date: dateCourte(api.metadata_modified_at ?? api.created_at),
        creeLe: dateCourte(api.created_at),
        raisons: [`nouvelle API data.gouv (recherche « ${terme} »)`],
      });
    }
  }
  return trouvees;
}

// ───────────────────────── Opendatasoft ─────────────────────────
type PortailOds = (typeof PORTAILS_ODS)[number];

/**
 * Règles de pertinence (documentées dans le README) :
 *  - tout jeu citant « Luynes » est retenu ;
 *  - « metropole » (Tours Métropole) : on ne garde que les jeux avec une colonne « commune/INSEE » (Luynes peut y figurer),
 *    sauf ceux de la seule Ville de Tours ;
 *  - « region » (Centre-Val de Loire) : on ne garde que les jeux citant l'Indre-et-Loire (ou le 37).
 */
function raisonOds(portail: PortailOds, jeu: Json): string | null {
  const metas = ((jeu.metas as Json | undefined)?.default ?? {}) as Json;
  if (jeu.has_records === false) return null;
  const producteur = texte(metas.publisher);
  const champs = ((jeu.fields as Json[] | undefined) ?? []).map((c) => texte(c.name));
  const colonneCommune = champs.some((c) => MOTS_COMMUNE.test(c));
  const contexte = `${texte(metas.title)} ${texte(metas.description)} ${((metas.keyword as string[] | undefined) ?? []).join(' ')}`;
  const citeLuynes = /luynes/i.test(contexte);
  const citeDepartement = /indre[- ]et[- ]loire|\b37\b/i.test(contexte);
  if (citeLuynes) return 'cite « Luynes »';
  if (portail.regle === 'metropole') {
    if (/^ville de tours$/i.test(producteur) && !colonneCommune) return null;
    return colonneCommune ? 'jeu métropolitain avec colonne commune/INSEE' : null;
  }
  return citeDepartement ? 'cite l\'Indre-et-Loire' : null;
}

async function chercherOds(portail: PortailOds): Promise<Trouvaille[]> {
  const trouvees: Trouvaille[] = [];
  for (let page = 0; page < PAGES_ODS_MAX; page++) {
    const url = `${portail.hote}/api/explore/v2.1/catalog/datasets?limit=${TAILLE_PAGE_ODS}&offset=${page * TAILLE_PAGE_ODS}&order_by=${encodeURIComponent('modified desc')}`;
    const reponse = await lireJson(url);
    const jeux = (reponse.results as Json[] | undefined) ?? [];
    for (const jeu of jeux) {
      const raison = raisonOds(portail, jeu);
      if (!raison) continue;
      const metas = ((jeu.metas as Json | undefined)?.default ?? {}) as Json;
      const id = texte(jeu.dataset_id);
      trouvees.push({
        jeton: `ods:${portail.id}:${id}`,
        identifiants: [id],
        titre: texte(metas.title) || id,
        producteur: texte(metas.publisher) || portail.nom,
        lien: `${portail.hote}/explore/dataset/${id}/`,
        date: dateCourte(metas.modified),
        raisons: [`${portail.nom} : ${raison}`],
      });
    }
    if (jeux.length < TAILLE_PAGE_ODS) break;
  }
  return trouvees;
}

// ───────────────────────── Collecte ─────────────────────────
async function collecter(): Promise<ResultatSource[]> {
  const taches: { nom: string; run: () => Promise<Trouvaille[]> }[] = [
    ...RECHERCHES_GOUV.map((r) => ({ nom: r.nom, run: () => chercherGouv(r) })),
    { nom: 'data.gouv.fr — nouvelles API (dataservices)', run: chercherDataservices },
    ...PORTAILS_ODS.map((p) => ({ nom: `Opendatasoft — ${p.nom}`, run: () => chercherOds(p) })),
  ];
  const resultats: ResultatSource[] = [];
  for (const tache of taches) {
    try {
      resultats.push({ nom: tache.nom, trouvailles: await tache.run() });
    } catch (erreur) {
      resultats.push({ nom: tache.nom, trouvailles: [], erreur: erreur instanceof Error ? erreur.message : String(erreur) });
    }
  }
  return resultats;
}

/** Fusionne les doublons (même jeton) en cumulant les raisons. */
function dedoublonner(resultats: ResultatSource[]): Trouvaille[] {
  const parJeton = new Map<string, Trouvaille>();
  for (const { trouvailles } of resultats) {
    for (const t of trouvailles) {
      const existante = parJeton.get(t.jeton);
      if (!existante) {
        parJeton.set(t.jeton, { ...t, raisons: [...t.raisons] });
        continue;
      }
      parJeton.set(t.jeton, {
        ...existante,
        jetonMaj: existante.jetonMaj ?? t.jetonMaj,
        raisons: [...new Set([...existante.raisons, ...t.raisons])],
      });
    }
  }
  return [...parJeton.values()];
}

// ───────────────────────── Jeux déjà connus ─────────────────────────
interface Connus {
  jetons: Set<string>;
  texteReference: string;
}

async function lireFichiersTexte(): Promise<string> {
  const fichiers = [
    ...(await readdir('data')).filter((f) => /^sources.*\.ts$/.test(f)).map((f) => join('data', f)),
    ...(await readdir('docs')).filter((f) => /^catalogue-donnees.*\.md$/.test(f)).map((f) => join('docs', f)),
  ];
  const contenus = await Promise.all(fichiers.map((f) => readFile(f, 'utf8')));
  return contenus.join('\n').toLowerCase();
}

async function lireConnusJson(chemin: string): Promise<Set<string>> {
  if (!existsSync(chemin)) return new Set();
  const brut = JSON.parse(await readFile(chemin, 'utf8')) as { connus?: Record<string, string> };
  return new Set(Object.keys(brut.connus ?? {}));
}

/** Jetons déjà signalés dans les issues « veille » précédentes (marqueurs `<!-- veille:… -->`). */
function jetonsDesIssues(): Set<string> {
  const jetons = new Set<string>();
  const sortie = execFileSync('gh', ['issue', 'list', '--label', ETIQUETTE, '--state', 'all', '--limit', '100', '--json', 'body,comments'], {
    encoding: 'utf8',
  });
  const issues = JSON.parse(sortie) as { body: string; comments: { body: string }[] }[];
  const textes = issues.flatMap((i) => [i.body, ...i.comments.map((c) => c.body)]);
  for (const t of textes) for (const m of t.matchAll(/<!-- veille:(\S+) -->/g)) jetons.add(m[1]!);
  return jetons;
}

function estConnu(t: Trouvaille, connus: Connus): boolean {
  if (connus.jetons.has(t.jeton)) return true;
  return t.identifiants.some((id) => id.length >= 8 && connus.texteReference.includes(id.toLowerCase()));
}

/** Nouveau = jamais vu ; « mis à jour » = vu, mais modifié depuis (jeux très pertinents seulement). */
function trier(trouvailles: Trouvaille[], connus: Connus): { nouveaux: Trouvaille[]; misAJour: Trouvaille[] } {
  const nouveaux: Trouvaille[] = [];
  const misAJour: Trouvaille[] = [];
  for (const t of trouvailles) {
    if (!estConnu(t, connus)) nouveaux.push(t);
    else if (t.jetonMaj && !connus.jetons.has(t.jetonMaj)) misAJour.push(t);
  }
  return { nouveaux, misAJour };
}

// ───────────────────────── Rédaction de l'issue ─────────────────────────
const echapper = (s: string): string => s.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

function ligne(t: Trouvaille, statut: string): string {
  const creation = t.creeLe && t.creeLe !== t.date ? `, créé le ${t.creeLe}` : '';
  return [
    `- **[${echapper(t.titre)}](${t.lien})** — ${echapper(t.producteur)}`,
    `  - Date : ${t.date || 'inconnue'}${creation}`,
    `  - Retenu parce que : ${t.raisons.join(' ; ')}`,
    `  - Statut probable : ${statut}`,
    `  <!-- veille:${t.jeton} -->${t.jetonMaj ? `<!-- veille:${t.jetonMaj} -->` : ''}`,
  ].join('\n');
}

function redigerCorps(nouveaux: Trouvaille[], misAJour: Trouvaille[], resultats: ResultatSource[]): string {
  const pannes = resultats.filter((r) => r.erreur);
  const parties = [
    `La veille automatique (scripts/veille.ts, sans IA) a trouvé **${nouveaux.length} nouveauté(s)** et **${misAJour.length} mise(s) à jour** de jeux très pertinents.`,
  ];
  if (nouveaux.length) parties.push('## Nouveaux jeux', nouveaux.map((t) => ligne(t, 'à examiner')).join('\n'));
  if (misAJour.length) parties.push('## Jeux déjà suivis, mis à jour', misAJour.map((t) => ligne(t, 'mise à jour d\'un jeu connu (à examiner si utilisé par le site)')).join('\n'));
  if (pannes.length) {
    parties.push(
      '## Sources en panne (non interrogées ce mois-ci)',
      pannes.map((p) => `- ${p.nom} : ${p.erreur}`).join('\n'),
    );
  }
  parties.push(
    '---',
    'L\'analyse de ces jeux par Claude se fait seulement à la demande (la veille elle-même ne consomme aucun crédit d\'IA). ' +
      'Pour classer un jeu comme « connu » ou « sans intérêt » : voir « Veille mensuelle » dans le README.',
  );
  return parties.join('\n\n');
}

function titreDuMois(date: Date): string {
  return `Veille données — ${MOIS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

// ───────────────────────── Publication ─────────────────────────
function gh(args: string[]): string {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

function publier(titre: string, corps: string): void {
  gh(['label', 'create', ETIQUETTE, '--description', 'Veille mensuelle des nouvelles données ouvertes', '--color', '0E8A16', '--force']);
  const existantes = JSON.parse(gh(['issue', 'list', '--label', ETIQUETTE, '--state', 'all', '--limit', '100', '--json', 'number,title'])) as {
    number: number;
    title: string;
  }[];
  const dumois = existantes.find((i) => i.title === titre);
  if (!dumois) {
    console.log(gh(['issue', 'create', '--title', titre, '--label', ETIQUETTE, '--body', corps]));
    return;
  }
  // Relance dans le mois : seules les nouveautés non encore signalées arrivent ici ; on les ajoute en commentaire.
  console.log(gh(['issue', 'comment', String(dumois.number), '--body', `Compléments de la veille relancée :\n\n${corps}`]));
}

// ───────────────────────── Programme ─────────────────────────
async function ecrireConnus(chemin: string, trouvailles: Trouvaille[]): Promise<void> {
  const existants = existsSync(chemin) ? ((JSON.parse(await readFile(chemin, 'utf8')) as { connus?: Record<string, string> }).connus ?? {}) : {};
  const connus: Record<string, string> = { ...existants };
  for (const t of trouvailles) {
    connus[t.jeton] = t.titre;
    if (t.jetonMaj) connus[t.jetonMaj] = t.titre;
  }
  const trie = Object.fromEntries(Object.entries(connus).sort(([a], [b]) => a.localeCompare(b)));
  await mkdir(dirname(chemin), { recursive: true });
  const contenu = { genere: new Date().toISOString().slice(0, 10), connus: trie };
  await writeFile(chemin, `${JSON.stringify(contenu, null, 2)}\n`);
  console.log(`${Object.keys(trie).length} jetons écrits dans ${chemin}.`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const init = args.includes('--init');
  const sansIssues = args.includes('--sans-issues');
  const cheminConnus = args.find((a) => a.startsWith('--connus='))?.slice('--connus='.length) ?? FICHIER_CONNUS;

  const resultats = await collecter();
  for (const r of resultats) console.log(`${r.erreur ? 'ECHEC' : 'ok   '} ${r.nom} : ${r.trouvailles.length} jeu(x) retenu(s)${r.erreur ? ` — ${r.erreur}` : ''}`);
  const trouvailles = dedoublonner(resultats);
  console.log(`${trouvailles.length} jeux retenus après filtrage et dédoublonnage.`);

  if (init) {
    await ecrireConnus(cheminConnus, trouvailles);
    return;
  }
  if (resultats.every((r) => r.erreur)) throw new Error('Toutes les sources sont en panne.');

  const jetons = await lireConnusJson(cheminConnus);
  if (!dryRun && !sansIssues) for (const j of jetonsDesIssues()) jetons.add(j);
  const connus: Connus = { jetons, texteReference: await lireFichiersTexte() };
  const { nouveaux, misAJour } = trier(trouvailles, connus);

  if (nouveaux.length + misAJour.length === 0) {
    console.log('Rien de nouveau : aucune issue ouverte.');
    return;
  }
  const titre = titreDuMois(new Date());
  const corps = redigerCorps(nouveaux, misAJour, resultats);
  if (dryRun) {
    console.log(`\n[dry-run] Issue « ${titre} » (étiquette ${ETIQUETTE}) — ${nouveaux.length} nouveau(x), ${misAJour.length} mis à jour :\n\n${corps}`);
    return;
  }
  publier(titre, corps);
}

main().catch((erreur: unknown) => {
  console.error(erreur instanceof Error ? erreur.message : erreur);
  process.exit(1);
});
