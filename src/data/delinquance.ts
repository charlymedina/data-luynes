/**
 * Données « Délinquance », générées par `npm run data` (voir data/sql/_delinquance.sql et delinquance_*.sql).
 * Source : bases communale et départementale de la délinquance enregistrée (SSMSI, ministère de l'Intérieur).
 */
import indicateursRows from './generated/delinquance_indicateurs.json';
import anneesRows from './generated/delinquance_annees.json';
import { firstRow } from './rows';

export interface IndicateurDelinquance {
  indicateur: string;
  libelle: string;
  /** Dénominateur du taux : « logements » (cambriolages) ou « habitants » */
  rapporte_a: 'logements' | 'habitants';
  annee_debut: number;
  annee_fin: number;
  /** Années publiées à Luynes sur la période de 3 ans (moins de 3 : taux laissé vide, secret statistique) */
  annees_publiees: number;
  faits_luynes: number | null;
  faits_par_an_luynes: number | null;
  taux_luynes: number | null;
  taux_37: number;
  taux_france: number;
}

export interface AnneeDelinquance {
  indicateur: string;
  libelle: string;
  annee: number;
  /** Vide quand la valeur n'est pas publiée (secret statistique) */
  nombre: number | null;
  diffuse: boolean;
}

export const indicateursDelinquance: readonly IndicateurDelinquance[] = indicateursRows as IndicateurDelinquance[];
export const anneesDelinquance: readonly AnneeDelinquance[] = anneesRows as AnneeDelinquance[];

/** Période commune à tous les indicateurs (3 dernières années publiées). */
export const periodeDelinquance = (() => {
  const premier = firstRow(indicateursDelinquance, 'delinquance_indicateurs');
  return { debut: premier.annee_debut, fin: premier.annee_fin };
})();

/** Indicateurs dont le taux de Luynes est publié sur toute la période. */
export const indicateursPublies: readonly (IndicateurDelinquance & { taux_luynes: number })[] = indicateursDelinquance.filter(
  (i): i is IndicateurDelinquance & { taux_luynes: number } => i.taux_luynes !== null,
);

/** Série annuelle d'un indicateur à Luynes. */
export function serieDe(indicateur: string): AnneeDelinquance[] {
  return anneesDelinquance.filter((a) => a.indicateur === indicateur);
}

export type PositionMoyenne = 'sous' | 'egal' | 'dessus';

/** Taux de Luynes comparé à celui de l'Indre-et-Loire (égalité à 0,05 près, l'arrondi affiché). */
export function positionVs37(i: IndicateurDelinquance & { taux_luynes: number }): PositionMoyenne {
  const ecart = i.taux_luynes - i.taux_37;
  if (Math.abs(ecart) < 0.05) return 'egal';
  return ecart < 0 ? 'sous' : 'dessus';
}

export const indicateursSous37 = indicateursPublies.filter((i) => positionVs37(i) === 'sous');
export const indicateursDessus37 = indicateursPublies.filter((i) => positionVs37(i) === 'dessus');
/** Indicateurs publiés sans aucun fait enregistré à Luynes sur la période. */
export const indicateursSansFait = indicateursPublies.filter((i) => i.faits_luynes === 0);

export interface AnneeNonPubliee {
  indicateur: IndicateurDelinquance;
  /** Années de la période non publiées par le ministère (secret statistique) */
  manquantes: number[];
  /** Années de la période publiées, avec leur nombre de faits */
  publiees: { annee: number; nombre: number }[];
}

/** Pour un indicateur sans taux : quelles années de la période manquent, et ce qui est publié. */
export function detailNonPublie(i: IndicateurDelinquance): AnneeNonPubliee {
  const periode = serieDe(i.indicateur).filter((a) => a.annee >= i.annee_debut && a.annee <= i.annee_fin);
  return {
    indicateur: i,
    manquantes: periode.filter((a) => !a.diffuse).map((a) => a.annee),
    publiees: periode.flatMap((a) => (a.diffuse && a.nombre !== null ? [{ annee: a.annee, nombre: a.nombre }] : [])),
  };
}

export interface HausseRecente {
  indicateur: IndicateurDelinquance;
  annee: number;
  nombre: number;
  /** Moyenne annuelle des deux années précédentes */
  moyenneAvant: number;
}

/**
 * Hausses nettes de la dernière année : au moins 5 faits de plus que la moyenne des deux années précédentes,
 * et 1,5 fois cette moyenne. Seuils volontairement prudents vu les petits nombres.
 */
export const haussesRecentes: readonly HausseRecente[] = indicateursPublies.flatMap((i) => {
  const serie = serieDe(i.indicateur);
  const derniere = serie.find((a) => a.annee === i.annee_fin);
  const avant = serie.filter((a) => a.annee >= i.annee_fin - 2 && a.annee < i.annee_fin && a.nombre !== null);
  if (!derniere || derniere.nombre === null || avant.length < 2) return [];
  const moyenneAvant = avant.reduce((s, a) => s + (a.nombre ?? 0), 0) / avant.length;
  const nette = derniere.nombre - moyenneAvant >= 5 && derniere.nombre >= 1.5 * moyenneAvant;
  return nette ? [{ indicateur: i, annee: derniere.annee, nombre: derniere.nombre, moyenneAvant }] : [];
});
