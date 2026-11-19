/**
 * Infobulles des graphiques (le dessin lui-même est fait côté serveur).
 *  - [data-chart="line"] : une ligne verticale suit la souris (ou les flèches du clavier) et s'accroche
 *    à l'année la plus proche ; l'infobulle liste toutes les séries à cette année.
 *  - [data-chart="rows"] : chaque ligne [data-tip] (ex. une tranche d'âge) affiche son infobulle au survol.
 * Les textes viennent des données : ils sont insérés avec textContent, jamais en HTML.
 */
export interface TipRow {
  label: string;
  value: string;
  color: string;
  /** Position verticale du point en % de la zone de tracé (graphiques en ligne uniquement). */
  y?: number;
}

export interface TipContent {
  title: string;
  rows: TipRow[];
}

export interface LinePoint extends TipContent {
  /** Position horizontale en % de la zone de tracé. */
  x: number;
}

const TIP_OFFSET_PX = 14;

function fillTip(tip: HTMLElement, content: TipContent): void {
  const title = document.createElement('p');
  title.className = 'font-semibold';
  title.textContent = content.title;
  const lines = content.rows.map((row) => {
    const line = document.createElement('p');
    line.className = 'mt-1 flex items-center gap-2';
    const key = document.createElement('span');
    key.className = 'inline-block h-[3px] w-3 rounded-full';
    key.style.background = row.color;
    const value = document.createElement('strong');
    value.textContent = row.value;
    const label = document.createElement('span');
    label.className = 'opacity-75';
    label.textContent = row.label;
    line.append(key, value, label);
    return line;
  });
  tip.replaceChildren(title, ...lines);
}

function readJson<T>(root: HTMLElement): T | null {
  const text = root.querySelector('script.chart-data')?.textContent;
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function nearestIndex(points: readonly LinePoint[], xPercent: number): number {
  let best = 0;
  points.forEach((point, i) => {
    if (Math.abs(point.x - xPercent) < Math.abs((points[best]?.x ?? 0) - xPercent)) best = i;
  });
  return best;
}

function initLineChart(root: HTMLElement): void {
  const points = readJson<LinePoint[]>(root);
  const plot = root.querySelector<HTMLElement>('.chart-plot');
  const cross = root.querySelector<HTMLElement>('.chart-cross');
  const tip = root.querySelector<HTMLElement>('.chart-tip');
  const dots = [...root.querySelectorAll<HTMLElement>('.chart-hover-dot')];
  if (!Array.isArray(points) || points.length === 0 || !plot || !cross || !tip) return;
  let current = points.length - 1;

  const show = (index: number): void => {
    const point = points[index];
    if (!point) return;
    current = index;
    cross.hidden = false;
    cross.style.left = `${point.x}%`;
    dots.forEach((dot, i) => {
      const row = point.rows[i];
      dot.hidden = row?.y === undefined;
      if (row?.y !== undefined) Object.assign(dot.style, { left: `${point.x}%`, top: `${row.y}%`, background: row.color });
    });
    fillTip(tip, point);
    tip.hidden = false;
    const onRight = point.x < 60;
    tip.style.left = `${point.x}%`;
    tip.style.transform = onRight ? `translateX(${TIP_OFFSET_PX}px)` : `translateX(calc(-100% - ${TIP_OFFSET_PX}px))`;
  };
  const hide = (): void => {
    cross.hidden = true;
    tip.hidden = true;
    dots.forEach((dot) => (dot.hidden = true));
  };

  plot.addEventListener('pointermove', (event) => {
    const rect = plot.getBoundingClientRect();
    show(nearestIndex(points, ((event.clientX - rect.left) / rect.width) * 100));
  });
  plot.addEventListener('pointerleave', hide);
  plot.addEventListener('focus', () => show(current));
  plot.addEventListener('blur', hide);
  plot.addEventListener('keydown', (event) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    show(Math.min(points.length - 1, Math.max(0, current + step)));
  });
}

function initRowsChart(root: HTMLElement): void {
  const tip = root.querySelector<HTMLElement>('.chart-tip');
  if (!tip) return;
  root.querySelectorAll<HTMLElement>('[data-tip]').forEach((row) => {
    let content: TipContent;
    try {
      content = JSON.parse(row.dataset.tip ?? '') as TipContent;
    } catch {
      return;
    }
    row.addEventListener('pointermove', (event) => {
      const rect = root.getBoundingClientRect();
      fillTip(tip, content);
      tip.hidden = false;
      const x = event.clientX - rect.left;
      const onRight = x < rect.width / 2;
      tip.style.left = `${x}px`;
      tip.style.top = `${row.offsetTop + row.offsetHeight + 6}px`;
      tip.style.transform = onRight ? 'translateX(8px)' : 'translateX(calc(-100% - 8px))';
    });
    row.addEventListener('pointerleave', () => (tip.hidden = true));
  });
}

export function initChartTooltips(): void {
  document.querySelectorAll<HTMLElement>('[data-chart="line"]').forEach(initLineChart);
  document.querySelectorAll<HTMLElement>('[data-chart="rows"]').forEach(initRowsChart);
}
