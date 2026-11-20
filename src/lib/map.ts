/**
 * Cartes « couches » (pages Patrimoine & risques et Accidents) : contour de la commune, zones (polygones semi-transparents,
 * ex. zone inondable) et couches de points, chacune affichable / masquable depuis la légende.
 * La librairie MapLibre (~1 Mo, ~280 Ko compressée) n'est chargée que sur les pages qui ont une carte, quand elle approche de l'écran.
 *
 * Chaque carte lit ses données dans un <script type="application/json" class="map-data"> (voir MapView.astro).
 * Les couleurs viennent des variables CSS du site, donc suivent le thème clair / sombre.
 */
import type { Map as MapLibreMap } from 'maplibre-gl';
import { addContour, createBaseMap, cssColor, loadMapLibre, showMapError, whenNearViewport, type Geometry } from './map-base';

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

/** Zone colorée (polygone), dessinée sous les points. */
export interface MapAreaData {
  id: string;
  colorVar: string;
  geometry: Geometry;
  /** Texte affiché au clic dans la zone. */
  label: string;
}

export interface MapData {
  contour: Geometry;
  areas: MapAreaData[];
  layers: MapLayerData[];
}

const AREA_OPACITY = 0.3;

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

function addAreas(map: MapLibreMap, areas: readonly MapAreaData[]): void {
  for (const area of areas) {
    const color = cssColor(area.colorVar);
    const feature = { type: 'Feature', geometry: area.geometry, properties: { label: area.label } } as GeoJSON.Feature;
    map.addSource(area.id, { type: 'geojson', data: feature });
    map.addLayer({ id: area.id, type: 'fill', source: area.id, paint: { 'fill-color': color, 'fill-opacity': AREA_OPACITY } });
    map.addLayer({ id: `${area.id}-line`, type: 'line', source: area.id, paint: { 'line-color': color, 'line-width': 1.5 } });
  }
}

function addPoints(map: MapLibreMap, layers: readonly MapLayerData[]): void {
  for (const layer of layers) {
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

/** Affiche ou masque une couche (et son contour pour les zones). */
function setVisible(map: MapLibreMap, id: string, visible: boolean): void {
  for (const layerId of [id, `${id}-line`]) {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
}

/** Applique l'état des cases à cocher de la légende. */
function applyLegend(root: HTMLElement, map: MapLibreMap): void {
  root.querySelectorAll<HTMLInputElement>('input[data-layer]').forEach((input) => setVisible(map, input.dataset.layer ?? '', input.checked));
}

async function createMap(root: HTMLElement, data: MapData): Promise<void> {
  const container = root.querySelector<HTMLElement>('.map-canvas');
  if (!container) return;
  const maplibregl = await loadMapLibre();
  const map = createBaseMap(maplibregl, container, data.contour, (m) => {
    addAreas(m, data.areas);
    addContour(m, data.contour);
    addPoints(m, data.layers);
    applyLegend(root, m);
  });

  // Clic : infobulle de l'élément le plus haut (un point situé dans une zone l'emporte sur la zone).
  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: true, offset: 10 });
  const clickable = [...data.layers.map((l) => l.id), ...data.areas.map((a) => a.id)];
  map.on('click', (event) => {
    const feature = map.queryRenderedFeatures(event.point, { layers: clickable.filter((id) => map.getLayer(id)) })[0];
    const label = feature?.properties?.label;
    if (typeof label === 'string') popup.setLngLat(event.lngLat).setText(label).addTo(map);
  });
  for (const layer of data.layers) {
    map.on('mouseenter', layer.id, () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', layer.id, () => (map.getCanvas().style.cursor = ''));
  }

  root.querySelectorAll<HTMLInputElement>('input[data-layer]').forEach((input) => {
    input.addEventListener('change', () => setVisible(map, input.dataset.layer ?? '', input.checked));
  });
  root.dataset.ready = 'true';
}

function readMapData(root: HTMLElement): MapData | null {
  try {
    return JSON.parse(root.querySelector('script.map-data')?.textContent ?? '') as MapData;
  } catch {
    return null;
  }
}

export function initMaps(): void {
  const roots = [...document.querySelectorAll<HTMLElement>('[data-map="couches"]')];
  whenNearViewport(roots, (root) => {
    const data = readMapData(root);
    if (data) createMap(root, data).catch(() => showMapError(root));
  });
}
