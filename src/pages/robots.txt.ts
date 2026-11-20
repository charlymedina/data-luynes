/** /robots.txt : tout le site est ouvert aux moteurs de recherche, avec l'adresse du plan du site. */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site?.origin ?? 'https://luynes.pages.dev';
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
