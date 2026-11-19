/**
 * Cartes interactives (MapLibre GL), chargées seulement sur les pages qui en contiennent une :
 * la librairie (~250 Ko) est importée à la demande, quand la carte approche de l'écran.
 *
 * Chaque carte lit ses données dans un <script type="application/json" class="map-data"> (voir MapView.astro) :
 * le contour de la commune et des couches de points. Fonds de carte OpenFreeMap (gratuits, sans clé),
 * en version claire ou sombre selon le thème du site ; les couleurs des points viennent des variables CSS.
 */
import type { Map as MapLibreMap, MapLayerMouseEvent } from 'maplibre-gl';

export interface MapPoint {
  lat: number;
  lon: number;
  /** Texte de l'infobulle (inséré en texte brut, jamais en HTML). */
  label: string;
}

export interface MapLayerData {
  id: string;
  /** Nom d'une variable CSS de couleur, ex. « --chart-1 ». */
  colorVar: string;
  radius: number;
  points: MapPoint[];
}

export interface MapData {
  contour: { type: string; coordinates: unknown };
  layers: MapLayerData[];
}

const STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const;
const CONTOUR_PADDING_PX = 24;

function siteTheme(): 'light' | 'dark' {
  const forced = document.documentElement.dataset.theme;
  if (forced === 'light' || forced === 'dark') return forced;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function cssColor(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || '#888888';
}

function toFeatures(layer: MapLayerData): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: layer.points.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      properties: { label: p.label },
    })),
  };
}

/** Ajoute (ou rajoute après un changement de fond de carte) le contour et les couches de points. */
function addOverlays(map: MapLibreMap, data: MapData): void {
  const contour = { type: 'Feature', geometry: data.contour, properties: {} } as GeoJSON.Feature;
  map.addSource('contour', { type: 'geojson', data: contour });
  map.addLayer({ id: 'contour-fill', type: 'fill', source: 'contour', paint: { 'fill-color': cssColor('--loire'), 'fill-opacity': 0.06 } });
  map.addLayer({ id: 'contour-line', type: 'line', source: 'contour', paint: { 'line-color': cssColor('--loire'), 'line-width': 2, 'line-dasharray': [2, 1.5] } });

  for (const layer of data.layers) {
    map.addSource(layer.id, { type: 'geojson', data: toFeatures(layer) });
    map.addLayer({
      id: layer.id,
      type: 'circle',
      source: layer.id,
      paint: {
        'circle-color': cssColor(layer.colorVar),
        'circle-radius': layer.radius,
        'circle-stroke-color': cssColor('--surface'),
        'circle-stroke-width': 2,
        'circle-opacity': 0.9,
      },
    });
  }
}

function contourBounds(data: MapData): [[number, number], [number, number]] {
  const coords = JSON.stringify(data.contour.coordinates).match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  const lons = coords.filter((_, i) => i % 2 === 0);
  const lats = coords.filter((_, i) => i % 2 === 1);
  return [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)],
  ];
}

/** Cases à cocher de la légende : afficher / masquer chaque couche. */
function bindLegend(root: HTMLElement, map: MapLibreMap): void {
  root.querySelectorAll<HTMLInputElement>('input[data-layer]').forEach((input) => {
    input.addEventListener('change', () => {
      const id = input.dataset.layer ?? '';
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', input.checked ? 'visible' : 'none');
    });
  });
}

function applyLegendVisibility(root: HTMLElement, map: MapLibreMap): void {
  root.querySelectorAll<HTMLInputElement>('input[data-layer]').forEach((input) => {
    const id = input.dataset.layer ?? '';
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', input.checked ? 'visible' : 'none');
  });
}

async function createMap(root: HTMLElement, data: MapData): Promise<void> {
  const container = root.querySelector<HTMLElement>('.map-canvas');
  if (!container) return;
  const [{ default: maplibregl }] = await Promise.all([import('maplibre-gl'), import('maplibre-gl/dist/maplibre-gl.css')]);

  let theme = siteTheme();
  const map = new maplibregl.Map({
    container,
    style: STYLES[theme],
    bounds: contourBounds(data),
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

  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: true, offset: 10 });
  const showPopup = (event: MapLayerMouseEvent): void => {
    const feature = event.features?.[0];
    const label = feature?.properties?.label;
    if (!feature || typeof label !== 'string' || feature.geometry.type !== 'Point') return;
    popup.setLngLat(feature.geometry.coordinates as [number, number]).setText(label).addTo(map);
  };
  for (const layer of data.layers) {
    map.on('click', layer.id, showPopup);
    map.on('mouseenter', layer.id, () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', layer.id, () => (map.getCanvas().style.cursor = ''));
  }

  map.on('style.load', () => {
    addOverlays(map, data);
    applyLegendVisibility(root, map);
  });
  bindLegend(root, map);

  // Le fond de carte suit le thème du site (bouton clair/sombre ou réglage du navigateur).
  const syncTheme = (): void => {
    const next = siteTheme();
    if (next === theme) return;
    theme = next;
    if (!map.getSource('contour')) return;
    map.setStyle(STYLES[theme]);
  };
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncTheme);
  root.dataset.ready = 'true';
}

function readMapData(root: HTMLElement): MapData | null {
  try {
    return JSON.parse(root.querySelector('script.map-data')?.textContent ?? '') as MapData;
  } catch {
    return null;
  }
}

/** Crée chaque carte de la page quand elle approche de l'écran (économise le chargement sur mobile). */
export function initMaps(): void {
  const roots = [...document.querySelectorAll<HTMLElement>('[data-map]')];
  if (roots.length === 0) return;
  const start = (root: HTMLElement): void => {
    const data = readMapData(root);
    if (!data) return;
    createMap(root, data).catch(() => {
      root.dataset.ready = 'error';
      const fallback = root.querySelector('.map-fallback');
      if (fallback) fallback.textContent = 'Carte indisponible pour le moment : les mêmes informations sont détaillées juste en dessous.';
    });
  };
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
