// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://luynes.pages.dev',
  // Pages construites en « population.html » : Cloudflare Pages les sert sous « /population » sans redirection
  // (avec le format par défaut « population/index.html », chaque lien « /population » faisait un aller-retour 308).
  build: { format: 'file' },
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
    // Aucun script intégré dans la page : la politique de sécurité (public/_headers) n'autorise que les fichiers du site.
    build: { assetsInlineLimit: 0 },
  },
});
