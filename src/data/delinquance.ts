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
