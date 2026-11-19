/**
 * Socle commun des cartes interactives (MapLibre GL) : chargement à la demande de la librairie,
 * fond de carte clair ou sombre qui suit le thème du site, cadrage sur la commune, création paresseuse
 * (seulement quand la carte approche de l'écran). Utilisé par map.ts (patrimoine) et map-ventes.ts (immobilier).
 */
import type { Map as MapLibreMap } from 'maplibre-gl';

export type MapLibre = typeof import('maplibre-gl');

/** Géométrie GeoJSON (Polygon ou MultiPolygon) telle que produite par les requêtes SQL. */
export interface Geometry {
  type: string;
  coordinates: unknown;
}

/** Fonds OpenFreeMap (gratuits, sans clé). Leurs polices « Noto Sans » servent aussi aux étiquettes. */
const STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const;
export const MAP_FONT = ['Noto Sans Regular'];
const CONTOUR_PADDING_PX = 24;

export function siteTheme(): 'light' | 'dark' {
  const forced = document.documentElement.dataset.theme;
  if (forced === 'light' || forced === 'dark') return forced;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Valeur d'une variable CSS du site (les couleurs changent avec le thème). */
export function cssColor(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || '#888888';
}

export function geometryBounds(geometry: Geometry): [[number, number], [number, number]] {
  const coords = JSON.stringify(geometry.coordinates).match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  const lons = coords.filter((_, i) => i % 2 === 0);
  const lats = coords.filter((_, i) => i % 2 === 1);
  return [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)],
  ];
}

/** Ajoute le contour pointillé de la commune (à rappeler après chaque changement de fond de carte). */
export function addContour(map: MapLibreMap, contour: Geometry): void {
  map.addSource('contour', { type: 'geojson', data: { type: 'Feature', geometry: contour, properties: {} } as GeoJSON.Feature });
  map.addLayer({ id: 'contour-fill', type: 'fill', source: 'contour', paint: { 'fill-color': cssColor('--loire'), 'fill-opacity': 0.05 } });
  map.addLayer({
    id: 'contour-line',
    type: 'line',
    source: 'contour',
    paint: { 'line-color': cssColor('--loire'), 'line-width': 2, 'line-dasharray': [2, 1.5] },
  });
}

export async function loadMapLibre(): Promise<MapLibre> {
  const [{ default: maplibregl }] = await Promise.all([import('maplibre-gl'), import('maplibre-gl/dist/maplibre-gl.css')]);
  return maplibregl;
}

/**
 * Crée la carte cadrée sur la commune. `onStyle` est appelé à chaque chargement du fond de carte
 * (au départ, puis à chaque bascule clair/sombre) pour (re)poser les couches du site.
 */
export function createBaseMap(maplibregl: MapLibre, container: HTMLElement, contour: Geometry, onStyle: (map: MapLibreMap) => void): MapLibreMap {
  let theme = siteTheme();
  const map = new maplibregl.Map({
    container,
    style: STYLES[theme],
    bounds: geometryBounds(contour),
    fitBoundsOptions: { padding: CONTOUR_PADDING_PX },
    cooperativeGestures: true,
    attributionControl: { compact: true },
    locale: {
      'CooperativeGesturesHandler.WindowsHelpText': 'Ctrl + molette pour zoomer',
      'CooperativeGesturesHandler.MacHelpText': '⌘ + molette pour zoomer',
      'CooperativeGesturesHandler.MobileHelpText': 'Deux doigts pour déplacer la carte',
    },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.on('style.load', () => onStyle(map));

  // Le fond de carte suit le thème du site (bouton clair/sombre ou réglage du navigateur).
  const syncTheme = (): void => {
    const next = siteTheme();
    if (next === theme) return;
    theme = next;
    map.setStyle(STYLES[theme]);
  };
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncTheme);
  return map;
}

/** Message de secours quand la carte ne peut pas s'afficher (navigateur sans WebGL, réseau coupé…). */
export function showMapError(root: HTMLElement): void {
  root.dataset.ready = 'error';
  const fallback = root.querySelector('.map-fallback');
  if (fallback) fallback.textContent = 'Carte indisponible pour le moment : les mêmes informations sont détaillées juste en dessous.';
}

/** Lance `start` pour chaque carte quand elle approche de l'écran (économise le chargement sur mobile). */
export function whenNearViewport(roots: readonly HTMLElement[], start: (root: HTMLElement) => void): void {
  if (!('IntersectionObserver' in window)) {
    roots.forEach(start);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        start(entry.target as HTMLElement);
      }
    },
    { rootMargin: '300px' },
  );
  roots.forEach((root) => observer.observe(root));
}
