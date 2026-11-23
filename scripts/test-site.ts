/**
 * Tests du site construit (npm run test:site), à lancer après « npm run build » :
 *  - chaque lien interne mène à une page ou un fichier qui existe ;
 *  - aucun « NaN », « undefined » ou « null » n'apparaît dans le texte des pages ;
 *  - chaque thème du registre a sa page, figure dans le menu de l'accueil, et chaque page cite ses sources ;
 *  - chaque page a ses balises d'aperçu pour le partage (og:image absolue, 1200 × 630, twitter:card) et l'image existe dans dist/og/ ;
 *  - la page « À propos » existe, est liée depuis le pied de page et figure dans le plan du site ;
 *  - chaque chiffre clé a sa bulle « Source · Calcul · Année » ;
 *  - aucun chiffre n'est collé à un mot ou à une parenthèse (« les5 062 », « à97,3 % », « 2025(27,8 % ») : signe d'un espace
 *    perdu entre un texte et une expression {…} dans une page Astro (la compression du HTML supprime les espaces en bout de ligne).
 */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { THEMES } from '../src/data/themes.ts';

const DIST = 'dist';

/** Texte visible d'une page : sans les scripts (données JSON des graphiques) ni les balises. */
function texteVisible(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

/**
 * Chiffres collés à du texte : une minuscule (ou « ; : ) ») juste avant un chiffre, ou un chiffre juste avant « ( ».
 * Les sigles légitimes (T2, D952, COVID-19…) sont en majuscules et ne sont pas concernés ; les entités HTML (&lt;90)
 * sont neutralisées avant le test.
 */
function chiffresCollesAuTexte(html: string): string[] {
  const texte = texteVisible(html).replace(/&[a-z#0-9]+;/gi, ' ');
  const trouves = new Set<string>();
  for (const [extrait] of texte.matchAll(/.{0,15}(?:[a-zà-ÿ;:)]\d|\d\().{0,10}/g)) trouves.add(extrait.replace(/\s+/g, ' ').trim());
  return [...trouves];
}

/** « /population#ages » → dist/population.html ; « /donnees/x.json » → dist/donnees/x.json ; « / » → dist/index.html. */
function cible(href: string): string {
  const chemin = href.split('#')[0]?.split('?')[0] ?? '';
  if (chemin === '' || chemin === '/') return path.join(DIST, 'index.html');
  if (path.extname(chemin)) return path.join(DIST, chemin);
  return path.join(DIST, `${chemin}.html`);
}

/** Balises Open Graph / Twitter d'une page, et présence de l'image d'aperçu dans dist/og/. */
function erreursApercu(page: string, html: string): string[] {
  const erreurs: string[] = [];
  const meta = (cle: string): string | undefined => new RegExp(`<meta (?:property|name)="${cle}" content="([^"]*)"`).exec(html)?.[1];
  for (const cle of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'twitter:card']) {
    if (!meta(cle)) erreurs.push(`${page} : balise ${cle} absente`);
  }
  if (meta('twitter:card') !== 'summary_large_image') erreurs.push(`${page} : twitter:card doit valoir summary_large_image`);
  if (meta('og:image:width') !== '1200' || meta('og:image:height') !== '630') erreurs.push(`${page} : l'image d'aperçu doit annoncer 1200 × 630`);
  const image = meta('og:image');
  if (image && !/^https:\/\/luynes\.pages\.dev\/og\/[a-z-]+\.png$/.test(image)) erreurs.push(`${page} : og:image doit être une adresse absolue du site (${image})`);
  else if (image && !existsSync(path.join(DIST, new URL(image).pathname))) erreurs.push(`${page} : image d'aperçu absente de dist (${image})`);
  return erreurs;
}

async function main(): Promise<void> {
  const pages = (await readdir(DIST)).filter((f) => f.endsWith('.html'));
  if (pages.length === 0) throw new Error('aucune page dans dist/ : lancer « npm run build » d\'abord');
  const erreurs: string[] = [];

  for (const page of pages) {
    const html = await readFile(path.join(DIST, page), 'utf8');
    for (const [, href] of html.matchAll(/href="(\/[^"]*)"/g)) {
      if (href && !href.startsWith('//') && !existsSync(cible(href))) erreurs.push(`${page} : lien cassé ${href}`);
    }
    const mots = texteVisible(html).match(/\b(NaN|undefined|null)\b/g);
    if (mots) erreurs.push(`${page} : texte suspect (${[...new Set(mots)].join(', ')})`);
    for (const extrait of chiffresCollesAuTexte(html)) erreurs.push(`${page} : chiffre collé au texte (espace manquant ?) « ${extrait} »`);
    erreurs.push(...erreursApercu(page, html));
    if (page !== '404.html' && !html.includes('>Sources<')) erreurs.push(`${page} : pas de sources en pied de page`);
    // Politique de sécurité (public/_headers, script-src 'self') : aucun script exécutable intégré dans la page.
    for (const [balise] of html.matchAll(/<script\b[^>]*>/g)) {
      const donnees = /type="application\/json"/.test(balise);
      if (!donnees && !/\ssrc="/.test(balise)) erreurs.push(`${page} : script intégré interdit par la CSP (${balise})`);
    }
    if (/\son[a-z]+="/.test(html)) erreurs.push(`${page} : attribut on…="…" interdit par la CSP`);
    // Chaque graphique, réglette, carte… (composants marqués data-indicateur) doit avoir sa bulle ⓘ.
    const sansBulle = (html.match(/data-indicateur="sans-bulle"/g) ?? []).length;
    if (sansBulle > 0) erreurs.push(`${page} : ${sansBulle} graphique(s) ou indicateur(s) sans bulle « Source · Calcul · Année »`);
    const chiffres = (html.match(/class="figure-value[\s"]/g) ?? []).length;
    const bulles = (html.match(/data-info-btn/g) ?? []).length;
    if (bulles < chiffres) erreurs.push(`${page} : ${chiffres - bulles} chiffre(s) clé(s) sans bulle « Source · Calcul · Année »`);
  }

  const accueil = await readFile(path.join(DIST, 'index.html'), 'utf8');
  for (const theme of THEMES) {
    if (!existsSync(path.join(DIST, `${theme.slug}.html`))) erreurs.push(`thème ${theme.slug} : page absente`);
    if (!accueil.includes(`href="/${theme.slug}"`)) erreurs.push(`thème ${theme.slug} : absent du menu de l'accueil`);
  }

  if (!existsSync(path.join(DIST, 'a-propos.html'))) erreurs.push('page « À propos » absente');
  if (!accueil.includes('href="/a-propos"')) erreurs.push("« À propos » : lien absent du pied de page");
  const plan = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
  if (!plan.includes('/a-propos<')) erreurs.push('« À propos » : absent du plan du site');

  if (erreurs.length > 0) {
    console.error(`✗ ${erreurs.length} problème(s) dans le site :`);
    for (const erreur of erreurs) console.error(`  - ${erreur}`);
    process.exit(1);
  }
  console.log(`✓ ${pages.length} pages vérifiées (liens, textes, sources, bulles)`);
}

main().catch((error: unknown) => {
  console.error('✗ Tests du site impossibles :', error instanceof Error ? error.message : error);
  process.exit(1);
});
