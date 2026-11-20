/**
 * Bulles « Source · Calcul · Année » (composant InfoTip.astro).
 * - souris : la bulle s'ouvre au survol du bouton ⓘ ;
 * - clavier : elle s'ouvre au focus, Échap la ferme ;
 * - toucher / clic : le bouton l'épingle ouverte, un nouveau clic ou un clic ailleurs la ferme.
 * La bulle utilise l'API « popover » (couche du dessus) et est placée près du bouton, sans sortir de l'écran.
 */
const MARGE = 12; // px laissés entre la bulle et les bords de l'écran
const ECART = 8; // px entre le bouton et la bulle

interface Bulle {
  bouton: HTMLButtonElement;
  bulle: HTMLElement;
  epinglee: boolean;
}

const supportePopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

function placer({ bouton, bulle }: Bulle): void {
  const zone = bouton.getBoundingClientRect();
  const largeur = bulle.offsetWidth;
  const hauteur = bulle.offsetHeight;
  const gauche = Math.min(Math.max(zone.right - largeur, MARGE), window.innerWidth - largeur - MARGE);
  const enDessous = zone.bottom + ECART + hauteur <= window.innerHeight - MARGE;
  const haut = enDessous ? zone.bottom + ECART : Math.max(MARGE, zone.top - ECART - hauteur);
  bulle.style.left = `${Math.max(MARGE, gauche)}px`;
  bulle.style.top = `${haut}px`;
}

function ouvrir(b: Bulle): void {
  if (supportePopover) {
    if (!b.bulle.matches(':popover-open')) b.bulle.showPopover();
  } else {
    b.bulle.hidden = false;
    b.bulle.classList.add('info-pop-open');
  }
  placer(b);
  b.bouton.setAttribute('aria-expanded', 'true');
}

function fermer(b: Bulle): void {
  b.epinglee = false;
  if (supportePopover) {
    if (b.bulle.matches(':popover-open')) b.bulle.hidePopover();
  } else {
    b.bulle.hidden = true;
    b.bulle.classList.remove('info-pop-open');
  }
  b.bouton.setAttribute('aria-expanded', 'false');
}

function brancher(b: Bulle, toutes: readonly Bulle[]): void {
  const fermerLesAutres = (): void => toutes.filter((autre) => autre !== b).forEach(fermer);
  b.bouton.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    fermerLesAutres();
    ouvrir(b);
  });
  b.bouton.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse' && !b.epinglee) fermer(b);
  });
  b.bouton.addEventListener('focus', () => {
    fermerLesAutres();
    ouvrir(b);
  });
  b.bouton.addEventListener('blur', () => {
    if (!b.epinglee) fermer(b);
  });
  b.bouton.addEventListener('click', (e) => {
    // Le bouton est parfois posé sur une carte cliquable : on ne suit pas son lien.
    e.preventDefault();
    e.stopPropagation();
    if (b.epinglee) {
      fermer(b);
      return;
    }
    fermerLesAutres();
    ouvrir(b);
    b.epinglee = true;
  });
}

export function initInfoTips(): void {
  const bulles: Bulle[] = [...document.querySelectorAll<HTMLButtonElement>('[data-info-btn]')].flatMap((bouton) => {
    const id = bouton.getAttribute('aria-controls');
    const bulle = id ? document.getElementById(id) : null;
    if (!bulle) return [];
    if (!supportePopover) bulle.hidden = true;
    return [{ bouton, bulle, epinglee: false }];
  });
  if (bulles.length === 0) return;

  bulles.forEach((b) => brancher(b, bulles));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const ouverte = bulles.find((b) => b.bouton.getAttribute('aria-expanded') === 'true');
    if (!ouverte) return;
    fermer(ouverte);
    ouverte.bouton.focus({ preventScroll: true });
    fermer(ouverte);
  });
  document.addEventListener('click', (e) => {
    const cible = e.target as Node;
    bulles.filter((b) => !b.bouton.contains(cible) && !b.bulle.contains(cible)).forEach(fermer);
  });
  window.addEventListener('scroll', () => bulles.filter((b) => b.bouton.getAttribute('aria-expanded') === 'true').forEach(placer), { passive: true });
  window.addEventListener('resize', () => bulles.forEach(fermer));
}
