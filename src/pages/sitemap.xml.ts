/**
 * Plan du site pour les moteurs de recherche (/sitemap.xml) : l'accueil et chaque page de thème du registre.
 * Les adresses sont écrites comme les liens du site (sans « .html » ni « / » final) ; `lastmod` = date des données.
 */
import type { APIRoute } from 'astro';
import { THEMES } from '../data/themes';
import { generatedAt } from '../data/commune';

export const GET: APIRoute = ({ site }) => {
  const base = site?.origin ?? 'https://luynes.pages.dev';
  const lastmod = generatedAt.toISOString().slice(0, 10);
  const chemins = ['/', ...THEMES.map((t) => `/${t.slug}`)];
  const urls = chemins
    .map((chemin) => `  <url><loc>${base}${chemin}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
