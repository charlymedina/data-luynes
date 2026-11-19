/**
 * Petites animations du site, toutes désactivées si le visiteur a demandé à limiter les animations.
 *  - [data-count]   : le chiffre « défile » de 0 à sa valeur quand il devient visible ;
 *  - .reveal        : la section apparaît en fondu ;
 *  - [data-bar]     : la barre de graphique se déploie.
 * Sans JavaScript, tout s'affiche directement avec les bonnes valeurs (rendu côté serveur).
 */
const COUNT_DURATION_MS = 1400;

function animateCount(element: HTMLElement): void {
  const target = Number(element.dataset.count);
  const decimals = Number(element.dataset.decimals ?? '0');
  if (!Number.isFinite(target)) return;

  const format = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const start = performance.now();

  const step = (now: number): void => {
    const progress = Math.min((now - start) / COUNT_DURATION_MS, 1);
    const eased = 1 - Math.pow(1 - progress, 4); // ralentit en fin de course
    element.textContent = format.format(target * eased);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function initAnimations(): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('motion');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        element.classList.add('is-visible');
        if (element.dataset.count !== undefined) animateCount(element);
        observer.unobserve(element);
      }
    },
    { threshold: 0.3 },
  );

  document
    .querySelectorAll<HTMLElement>('.reveal, [data-count], [data-bar]')
    .forEach((element) => observer.observe(element));
}
