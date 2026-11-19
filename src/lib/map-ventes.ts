/**
 * Carte des ventes immobilières (page Immobilier) : un point par vente, coloré selon le prix au m²,
 * regroupé en pastilles numérotées quand on dézoome ; clic sur un point → fiche de la vente.
 * Les filtres (type de bien, année) agissent sur la carte ET sur le tableau des ventes ; le tableau
 * fonctionne même si la carte ne peut pas s'afficher (navigateur sans WebGL…).
 * Les ventes sont téléchargées à part (/donnees/ventes-immobilieres.json) quand la carte approche de l'écran.
 */
import type { GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent } from 'maplibre-gl';
import { addContour, createBaseMap, cssColor, loadMapLibre, MAP_FONT, showMapError, whenNearViewport, type Geometry } from './map-base';
import type { Vente } from '../data/immobilier';

interface Filtres {
  type: string;
  annee: string;
}

const TOUS = 'tous';
const RAYON_CLUSTER_PX = 38;
const ZOOM_MAX_CLUSTER = 15;

const euros = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const dateLongue = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const nombre = (v: number): string => euros.format(v).replace(/ /g, ' ');

function lireFiltres(root: HTMLElement): Filtres {
  const valeur = (nom: string): string => root.querySelector<HTMLInputElement>(`input[name="${nom}"]:checked`)?.value ?? TOUS;
  return { type: valeur('filtre-type'), annee: valeur('filtre-annee') };
}

function correspond(type: string, annee: string, filtres: Filtres): boolean {
  return (filtres.type === TOUS || filtres.type === type) && (filtres.annee === TOUS || filtres.annee === annee);
}

/** Masque les lignes du tableau qui ne correspondent pas aux filtres et met à jour le compteur. */
function filtrerTableau(root: HTMLElement, filtres: Filtres): void {
  let visibles = 0;
  root.querySelectorAll<HTMLTableRowElement>('tr[data-type]').forEach((ligne) => {
    const ok = correspond(ligne.dataset.type ?? '', ligne.dataset.annee ?? '', filtres);
    ligne.hidden = !ok;
    if (ok) visibles++;
  });
  root.querySelectorAll('.ventes-compte').forEach((el) => (el.textContent = `${nombre(visibles)} vente${visibles > 1 ? 's' : ''}`));
}

function toFeatures(ventes: readonly Vente[], filtres: Filtres): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: ventes
      .filter((v) => correspond(v.type, String(v.annee), filtres))
      .map((v) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [v.lon, v.lat] },
        // prix_m2 absent (et non null) quand il n'a pas de sens : la carte teste sa présence avec « has ».
        properties: { id: v.id, ...(v.prix_m2 === null ? {} : { prix_m2: v.prix_m2 }) },
      })),
  };
}

function ajouterCouches(map: MapLibreMap, data: GeoJSON.FeatureCollection, seuils: readonly number[]): void {
  map.addSource('ventes', { type: 'geojson', data, cluster: true, clusterRadius: RAYON_CLUSTER_PX, clusterMaxZoom: ZOOM_MAX_CLUSTER });
  map.addLayer({
    id: 'ventes-groupes',
    type: 'circle',
    source: 'ventes',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': cssColor('--ink'),
      'circle-opacity': 0.82,
      'circle-radius': ['step', ['get', 'point_count'], 13, 10, 17, 40, 22],
      'circle-stroke-color': cssColor('--surface'),
      'circle-stroke-width': 2,
    },
  });
  map.addLayer({
    id: 'ventes-groupes-nombre',
    type: 'symbol',
    source: 'ventes',
    filter: ['has', 'point_count'],
    layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': MAP_FONT, 'text-size': 12, 'text-allow-overlap': true },
    paint: { 'text-color': cssColor('--bg') },
  });
  const rampe = seuils.flatMap((seuil, i) => [seuil, cssColor(`--seq-${i + 2}`)]);
  map.addLayer({
    id: 'ventes-points',
    type: 'circle',
    source: 'ventes',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': ['case', ['has', 'prix_m2'], ['step', ['get', 'prix_m2'], cssColor('--seq-1'), ...rampe], cssColor('--seq-none')],
      'circle-radius': ['case', ['has', 'prix_m2'], 7, 5],
      'circle-stroke-color': cssColor('--surface'),
      'circle-stroke-width': 1.5,
    },
  });
}

function ligne(parent: HTMLElement, libelle: string, valeur: string): void {
  const p = document.createElement('p');
  p.className = 'mt-0.5';
  const l = document.createElement('span');
  l.className = 'opacity-75';
  l.textContent = `${libelle} : `;
  const v = document.createElement('strong');
  v.textContent = valeur;
  p.append(l, v);
  parent.append(p);
}

/** Fiche d'une vente, construite en texte brut (jamais de HTML venu des données). */
function fiche(v: Vente): HTMLElement {
  const div = document.createElement('div');
  const titre = document.createElement('p');
  titre.className = 'font-semibold';
  titre.textContent = `${v.type} · ${dateLongue.format(new Date(v.date))}`;
  div.append(titre);
  ligne(div, 'Prix', `${nombre(v.prix)} €`);
  if (v.surface_bati) ligne(div, 'Surface', `${nombre(v.surface_bati)} m²${v.pieces ? ` · ${v.pieces} pièce${v.pieces > 1 ? 's' : ''}` : ''}`);
  if (v.surface_terrain) ligne(div, 'Terrain', `${nombre(v.surface_terrain)} m²`);
  if (v.prix_m2) ligne(div, 'Prix au m²', `${nombre(v.prix_m2)} €/m²`);
  const rue = document.createElement('p');
  rue.className = 'mt-1 opacity-75';
  rue.textContent = v.rue ?? '';
  div.append(rue);
  return div;
}

async function creerCarte(root: HTMLElement, contour: Geometry, seuils: readonly number[]): Promise<void> {
  const container = root.querySelector<HTMLElement>('.map-canvas');
  const url = root.dataset.ventesUrl;
  if (!container || !url) return;
  const [maplibregl, reponse] = await Promise.all([loadMapLibre(), fetch(url)]);
  if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
  const ventes = (await reponse.json()) as Vente[];
  const parId = new Map(ventes.map((v) => [v.id, v]));

  const map = createBaseMap(maplibregl, container, contour, (m) => {
    addContour(m, contour);
    ajouterCouches(m, toFeatures(ventes, lireFiltres(root)), seuils);
  });

  const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, offset: 10, maxWidth: '16rem' });
  map.on('click', 'ventes-points', (event: MapLayerMouseEvent) => {
    const vente = parId.get(String(event.features?.[0]?.properties?.id ?? ''));
    if (vente) popup.setLngLat([vente.lon, vente.lat]).setDOMContent(fiche(vente)).addTo(map);
  });
  // Clic sur une pastille : on zoome juste assez pour la séparer en ventes.
  map.on('click', 'ventes-groupes', async (event: MapLayerMouseEvent) => {
    const groupe = event.features?.[0];
    const source = map.getSource<GeoJSONSource>('ventes');
    if (!groupe || !source || groupe.geometry.type !== 'Point') return;
    const zoom = await source.getClusterExpansionZoom(Number(groupe.properties?.cluster_id));
    map.easeTo({ center: groupe.geometry.coordinates as [number, number], zoom });
  });
  for (const couche of ['ventes-points', 'ventes-groupes']) {
    map.on('mouseenter', couche, () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', couche, () => (map.getCanvas().style.cursor = ''));
  }

  root.addEventListener('change', () => {
    popup.remove();
    map.getSource<GeoJSONSource>('ventes')?.setData(toFeatures(ventes, lireFiltres(root)));
  });
  root.dataset.ready = 'true';
}

function lireJson<T>(root: HTMLElement, selecteur: string): T | null {
  try {
    return JSON.parse(root.querySelector(selecteur)?.textContent ?? '') as T;
  } catch {
    return null;
  }
}

export function initCarteVentes(): void {
  const roots = [...document.querySelectorAll<HTMLElement>('[data-map="ventes"]')];
  for (const root of roots) {
    // Les filtres du tableau marchent tout de suite, carte ou pas.
    root.addEventListener('change', () => filtrerTableau(root, lireFiltres(root)));
    filtrerTableau(root, lireFiltres(root));
  }
  whenNearViewport(roots, (root) => {
    const config = lireJson<{ contour: Geometry; seuils: number[] }>(root, 'script.map-data');
    if (config) creerCarte(root, config.contour, config.seuils).catch(() => showMapError(root));
  });
}
