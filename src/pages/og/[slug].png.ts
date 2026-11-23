/**
 * Images d'aperçu pour le partage (/og/<page>.png, 1200 × 630), produites au build à partir des données :
 * titre de la page + un chiffre clé (voir src/lib/og-pages.ts et og-image.ts).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { imageOg } from '../../lib/og-image';
import { OG_PAGES, ogPage } from '../../lib/og-pages';

export const getStaticPaths: GetStaticPaths = () => OG_PAGES.map((p) => ({ params: { slug: p.slug } }));

export const GET: APIRoute = async ({ params }) => {
  const png = await imageOg(ogPage(String(params.slug)));
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
