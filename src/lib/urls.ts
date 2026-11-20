/**
 * Adresses internes du site. Les pages sont construites en fichiers « /population.html »
 * (astro.config.mjs : build.format = 'file') et Cloudflare Pages les sert sous « /population »,
 * sans redirection : tous les liens internes s'écrivent donc sans « / » final.
 */

/** « /population.html », « /population/ » ou « /index.html » → « /population » ou « / ». */
export function pagePath(pathname: string): string {
  const clean = pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '');
  return clean === '' ? '/' : clean;
}

/** Lien vers une page de thème, avec une ancre facultative : themeHref('population', 'ages') → « /population#ages ». */
export function themeHref(slug: string, anchor?: string): string {
  return anchor ? `/${slug}#${anchor}` : `/${slug}`;
}
