/**
 * Phrases « Le saviez-vous ? » construites à partir des données (aucun chiffre écrit à la main).
 * Si une donnée change au prochain recensement, la phrase suit automatiquement.
 */
import { commune, rang } from '../data/commune';
import { agesDe, derniereAnneeEtatCivil, faits, pyramide } from '../data/population';
import { formatNumber, formatOneIn, formatPercent, formatRank, formatRatio } from './format';

/** Écart femmes/hommes chez les plus âgés : seulement si l'écart est vraiment parlant. */
const RATIO_FEMMES_PARLANT = 1.5;

/** Part des communes du département devant lesquelles Luynes se classe (ex. rang 46 sur 272 → 83 %). */
export function partDevancee(rangLuynes: number): number {
  return Math.round((100 * (rang.nb_communes - rangLuynes)) / rang.nb_communes);
}

/** « +3,8 % » / « −3,7 % » */
export function formatVariation(pct: number): string {
  return `${pct > 0 ? '+' : pct < 0 ? '−' : ''}${formatPercent(Math.abs(pct))}`;
}

export function faitsCommune(): string[] {
  return [
    `Avec ${formatNumber(commune.densite_hab_km2)} habitants au km², Luynes est ${formatRatio(commune.densite_hab_km2, rang.densite_departement)} fois plus dense que la moyenne de l'Indre-et-Loire.`,
    `Luynes est la ${formatRank(rang.rang_population)} commune la plus peuplée du département… sur ${rang.nb_communes} !`,
    `Avec ${formatNumber(commune.surface_km2, 1)} km², Luynes est plus grande que ${partDevancee(rang.rang_surface)} % des communes d'Indre-et-Loire (la moitié d'entre elles font moins de ${formatNumber(rang.surface_mediane_km2, 1)} km²).`,
    `Luynes est la ${formatRank(rang.rang_densite)} commune la plus dense d'Indre-et-Loire : plus dense que ${partDevancee(rang.rang_densite)} % des communes du département.`,
  ];
}

/** Anecdotes qui comparent Luynes aux autres communes du département (population et âges). */
function faitsPopulationDepartement(): string[] {
  const liste = [
    `Pour la part des 65 ans et plus, Luynes se classe ${formatRank(rang.rang_65_plus)} sur ${rang.nb_communes} communes d'Indre-et-Loire.`,
  ];
  const sensInverse = rang.evolution_pct < 0 && rang.evolution_departement_pct > 0;
  if (sensInverse) {
    liste.push(
      `Entre ${rang.annee_debut} et ${rang.annee_fin}, Luynes a perdu ${formatPercent(-rang.evolution_pct)} de ses habitants, alors que l'Indre-et-Loire en gagnait ${formatPercent(rang.evolution_departement_pct)}.`,
    );
  }
  return liste;
}

export function faitsPopulation(): string[] {
  const luynes = agesDe('Luynes');
  const france = agesDe('France');
  const plusAges = pyramide.find((t) => t.ordre === Math.max(...pyramide.map((p) => p.ordre)));
  const liste = [
    `En ${faits.annee_premiere}, Luynes comptait ${formatNumber(faits.population_premiere)} habitants. Depuis 1968, sa population a été multipliée par ${formatNumber(faits.multiplie_depuis_1968, 1)}.`,
    `Le grand boom : entre ${faits.hausse_annee_debut} et ${faits.hausse_annee_fin}, Luynes a gagné ${formatNumber(faits.hausse_par_an)} habitants par an en moyenne.`,
    `Record historique : ${formatNumber(faits.population_pic)} habitants en ${faits.annee_pic}. Le point le plus bas ? ${formatNumber(faits.population_creux)} en ${faits.annee_creux}.`,
    `La moitié des Luynois a plus de ${formatNumber(Math.floor(luynes.age_median))} ans. En France, l'âge médian est de ${formatNumber(france.age_median, 1)} ans.`,
    `À Luynes, ${formatOneIn(luynes.part_65_plus, 'habitant')} a 65 ans ou plus.`,
    `En ${derniereAnneeEtatCivil.annee}, ${formatNumber(derniereAnneeEtatCivil.naissances)} bébés luynois sont nés.`,
    ...faitsPopulationDepartement(),
  ];
  if (plusAges && plusAges.hommes > 0 && plusAges.femmes / plusAges.hommes >= RATIO_FEMMES_PARLANT) {
    liste.push(
      `Chez les ${plusAges.libelle.replace(' et +', ' et plus')}, on compte ${formatRatio(plusAges.femmes, plusAges.hommes)} femmes pour 1 homme. Luynes accueille le centre hospitalier Jean-Pagès et son EHPAD : leurs résidents comptent parmi les habitants.`,
    );
  }
  return liste;
}
