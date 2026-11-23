/**
 * Dessin des images d'aperçu pour le partage (1200 × 630 px), sans service externe :
 * satori transforme une mise en page (type HTML/CSS simplifié) en SVG, et resvg le convertit en PNG.
 * Palette « Loire & tuffeau » (voir src/styles/global.css, thème clair), marque de l'aqueduc (public/favicon.svg).
 * Les polices viennent des paquets @fontsource (fichiers .woff ; satori ne lit pas le .woff2).
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { OG_HAUTEUR, OG_LARGEUR, type OgPage } from './og-pages';

const COULEURS = {
  fond: '#f6f0e1',
  surface: '#fffcf5',
  encre: '#1b2a2e',
  encre2: '#46585d',
  ligne: '#e4d9c0',
  loire: '#0b6b72',
  accent: '#d9542a',
} as const;

/** Trois arches de l'aqueduc au-dessus d'une vague de Loire (même dessin que le favicon), aux couleurs de l'image. */
const ARCHES_SVG = (couleurPierre: string, couleurFond: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${couleurPierre}"/><path fill="${couleurFond}" fill-rule="evenodd" d="M4.5 8.5h23v14.5h-23Z M7 23v-8a2.25 2.25 0 0 1 4.5 0v8Z M13.75 23v-8a2.25 2.25 0 0 1 4.5 0v8Z M20.5 23v-8a2.25 2.25 0 0 1 4.5 0v8Z M23.5 8.5h4v3l-1.6-1.2-1.2 1-1.2-1.4Z"/><path d="M4 27c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0 4 1.5 6 0" fill="none" stroke="${COULEURS.accent}" stroke-width="2.2" stroke-linecap="round"/></svg>`;

const enImage = (svg: string): string => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const POLICES = [
  { name: 'Bricolage', weight: 800 as const, fichier: '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff' },
  { name: 'Bricolage', weight: 700 as const, fichier: '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff' },
  { name: 'Inter', weight: 400 as const, fichier: '@fontsource/inter/files/inter-latin-400-normal.woff' },
  { name: 'Inter', weight: 600 as const, fichier: '@fontsource/inter/files/inter-latin-600-normal.woff' },
];

let polices: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 700 | 800; style: 'normal' }[]> | undefined;
function chargerPolices(): NonNullable<typeof polices> {
  polices ??= Promise.all(
    POLICES.map(async ({ name, weight, fichier }) => ({
      name,
      weight,
      style: 'normal' as const,
      data: await readFile(path.join(process.cwd(), 'node_modules', fichier)),
    })),
  );
  return polices;
}

type Noeud = { type: string; props: { style?: Record<string, unknown>; children?: unknown; [cle: string]: unknown } };
/** Petit constructeur d'éléments pour satori (équivalent d'un <div style="…">). */
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Noeud => ({
  type,
  props: { style: { display: 'flex', ...style }, children, ...extra },
});

/** Taille du titre selon sa longueur, pour qu'il tienne sur deux lignes au plus. */
const tailleTitre = (page: OgPage): number => (page.titre[0].length + page.titre[1].length > 20 ? 92 : 110);

function mettreEnPage(page: OgPage): Noeud {
  const taille = tailleTitre(page);
  return el(
    'div',
    { width: OG_LARGEUR, height: OG_HAUTEUR, backgroundColor: COULEURS.fond, boxSizing: 'border-box', padding: '56px 72px', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'Inter', color: COULEURS.encre },
    [
      // Grande marque estompée, en haut à droite
      el('img', { position: 'absolute', right: 72, top: 40, width: 160, height: 160, opacity: 0.22 }, undefined, { src: enImage(ARCHES_SVG(COULEURS.loire, COULEURS.fond)), width: 160, height: 160 }),
      // En-tête : marque + nom du site
      el('div', { alignItems: 'center', gap: 16 }, [
        el('img', { width: 52, height: 52 }, undefined, { src: enImage(ARCHES_SVG(COULEURS.loire, COULEURS.fond)), width: 52, height: 52 }),
        el('div', { fontSize: 30, fontWeight: 600, color: COULEURS.loire }, 'Luynes en chiffres'),
      ]),
      // Titre de la page
      el('div', { flexDirection: 'column' }, [
        el('div', { flexWrap: 'wrap', fontFamily: 'Bricolage', fontWeight: 800, fontSize: taille, lineHeight: 1.0, letterSpacing: -2 }, [
          el('span', { whiteSpace: 'pre' }, page.titre[0]),
          el('span', { color: COULEURS.accent }, page.titre[1]),
        ]),
      ]),
      // Chiffre clé
      el('div', { alignItems: 'center', gap: 28, backgroundColor: COULEURS.surface, border: `2px solid ${COULEURS.ligne}`, borderRadius: 28, padding: '22px 32px', boxSizing: 'border-box' }, [
        el('div', { fontFamily: 'Bricolage', fontWeight: 800, fontSize: 72, lineHeight: 1, color: COULEURS.loire, whiteSpace: 'nowrap' }, page.chiffre.valeur),
        el('div', { fontSize: 28, lineHeight: 1.25, color: COULEURS.encre2, flex: 1 }, page.chiffre.legende),
      ]),
    ],
  );
}

/** Image PNG 1200 × 630 d'une page. */
export async function imageOg(page: OgPage): Promise<Buffer> {
  // Les types de satori attendent des éléments React ; notre structure équivalente est acceptée à l'exécution.
  const svg = await satori(mettreEnPage(page) as unknown as Parameters<typeof satori>[0], {
    width: OG_LARGEUR,
    height: OG_HAUTEUR,
    fonts: await chargerPolices(),
  });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_LARGEUR } }).render().asPng();
}
