/**
 * Anecdotes « Le saviez-vous ? » du thème Budget, calculées à partir des comptes DGFiP
 * (aucun chiffre écrit à la main). Ton neutre : on décrit, on ne juge pas.
 */
import { anneeTauxStable, resumeBudget } from '../data/budget';
import { formatCommunes, formatNumber, formatRank } from './format';

/** Montant en millions d'euros, une décimale : 5 457 310 → « 5,5 millions d'euros ». */
export function enMillions(euros: number): string {
  return `${formatNumber(euros / 1_000_000, 1)} millions d'euros`;
}

export function faitsBudget(): string[] {
  const r = resumeBudget;
  const stable = anneeTauxStable();
  const liste = [
    `Sur 100 € dépensés par la commune pour son fonctionnement en ${r.annee}, ${formatNumber(Math.round(r.part_personnel))} € paient les salaires du personnel communal.`,
    `En ${r.annee}, la dette de Luynes représente ${formatNumber(r.dette_hab)} € par habitant, contre ${formatNumber(r.dette_hab_strate)} € en moyenne pour les communes de même taille. Elle avait culminé à ${formatNumber(r.dette_hab_max)} € par habitant en ${r.annee_dette_max}.`,
    `De ${r.annee - 9} à ${r.annee}, la commune a consacré ${enMillions(r.equipement_10_ans)} à ses équipements (travaux, bâtiments, voirie, matériel).`,
    `Avec ${formatNumber(r.taux_foncier, 1)} %, le taux de taxe foncière de Luynes est le ${formatRank(r.rang_taux_foncier)} plus élevé des ${formatCommunes(r.nb_communes)}.`,
    `${formatNumber(r.part_impots_locaux, 1)} % des recettes courantes de la commune viennent des impôts locaux ; la dotation de l'État en apporte ${formatNumber(r.part_dotation_etat, 1)} %.`,
  ];
  if (stable !== null && stable < r.annee - 5) {
    liste.push(
      `Hors réforme de 2021 (la part de taxe foncière du département a été transférée aux communes), le taux de taxe foncière voté par Luynes n'a pas changé depuis ${stable}.`,
    );
  }
  return liste;
}
