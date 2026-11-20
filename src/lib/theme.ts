/**
 * Bouton clair / sombre de l'en-tête.
 * Sans choix enregistré, le site suit le thème du navigateur ; un clic force l'autre thème
 * et le mémorise (localStorage, clé « theme »). Le script inline de Base.astro applique ce choix
 * avant l'affichage pour éviter un flash.
 */
type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

/** Thème affiché : celui choisi avec le bouton, sinon celui du navigateur (utilisé aussi par les cartes). */
export function siteTheme(): Theme {
  const forced = document.documentElement.dataset.theme;
  if (forced === 'light' || forced === 'dark') return forced;
  return darkQuery.matches ? 'dark' : 'light';
}

function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Stockage indisponible (navigation privée…) : le choix vaut pour la page en cours.
  }
}

function updateButton(button: HTMLButtonElement): void {
  // Le libellé change avec l'état (pas d'aria-pressed en plus : les lecteurs d'écran annonceraient un état contradictoire).
  const isDark = siteTheme() === 'dark';
  button.setAttribute('aria-label', isDark ? 'Passer en thème clair' : 'Passer en thème sombre');
  button.title = isDark ? 'Thème clair' : 'Thème sombre';
}

export function initThemeToggle(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!button) return;

  updateButton(button);
  darkQuery.addEventListener('change', () => updateButton(button));
  button.addEventListener('click', () => {
    const next: Theme = siteTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    saveTheme(next);
    updateButton(button);
  });
}
