/**
 * Barre de navigation : ombre quand on a défilé, et panneau « menu » accessible
 * (aria-expanded, fermeture par Échap / clic extérieur / clic sur un lien, focus géré, défilement bloqué).
 */
const SCROLL_SHADOW_PX = 8;

function watchScroll(header: HTMLElement): void {
  let ticking = false;
  const update = (): void => {
    header.toggleAttribute('data-scrolled', window.scrollY > SCROLL_SHADOW_PX);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

function initMenu(header: HTMLElement): void {
  const button = header.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const panel = header.querySelector<HTMLElement>('[data-nav-panel]');
  const label = header.querySelector<HTMLElement>('[data-nav-label]');
  if (!button || !panel) return;

  const links = (): HTMLAnchorElement[] => Array.from(panel.querySelectorAll<HTMLAnchorElement>('a'));
  const isOpen = (): boolean => button.getAttribute('aria-expanded') === 'true';

  const setOpen = (open: boolean, restoreFocus = true): void => {
    button.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
    panel.hidden = !open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) links()[0]?.focus();
    else if (restoreFocus) button.focus();
  };

  button.addEventListener('click', () => setOpen(!isOpen()));
  panel.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false, false);
  });
  document.addEventListener('click', (event) => {
    if (isOpen() && !header.contains(event.target as Node)) setOpen(false, false);
  });
  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;
    // Le focus reste dans le menu (et le bouton qui le ferme) tant qu'il est ouvert.
    const focusables = [button, ...links()];
    const first = focusables[0];
    const last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  // Le menu se ferme s'il était ouvert et que l'écran s'élargit au point d'afficher les liens.
  window.matchMedia('(min-width: 64rem)').addEventListener('change', () => {
    if (isOpen() && getComputedStyle(button).display === 'none') setOpen(false, false);
  });
}

export function initNav(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  watchScroll(header);
  initMenu(header);
}
