/**
 * Anecdotes « Le saviez-vous ? » de la page Budget & vie municipale, calculées à partir des comptes DGFiP et des
 * données publiques sur les élus et les marchés (aucun chiffre écrit à la main). Ton strictement neutre : on décrit, on ne juge pas.
 */
import { anneeTauxStable, resumeBudget } from '../data/budget';
import {
  anneesElus,
  anneesSubventions,
  appelsOffres,
  comparaison,
  conseil,
  derniereAnnee,
  marches,
  premiereAnnee,
  professions,
} from '../data/budget-vie-municipale';
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
  liste.push(...faitsVieMunicipale());
  return liste;
}

/** Indemnités des élus, subventions, conseil municipal, appels d'offres et marchés. */
function faitsVieMunicipale(): string[] {
  const elus = anneesElus.find((a) => a.annee === derniereAnnee);
  const elusDebut = anneesElus.find((a) => a.annee === premiereAnnee);
  const asso = anneesSubventions.find((a) => a.annee === derniereAnnee);
  const premiereProfession = professions[0];
  const faits: string[] = [];

  if (elus && elusDebut) {
    faits.push(
      `En ${derniereAnnee}, les indemnités des élus représentent ${formatNumber(elus.indemnites_par_habitant, 1)} € par habitant, contre ${formatNumber(comparaison('indemnites').strate_par_habitant, 1)} € en moyenne dans les communes de même taille.`,
      `Les indemnités des élus de Luynes étaient de ${formatNumber(elusDebut.indemnites)} € en ${premiereAnnee} et de ${formatNumber(elus.indemnites)} € en ${derniereAnnee}.`,
    );
  }
  if (asso) {
    faits.push(
      `Les subventions aux associations représentent ${formatNumber(asso.associations_par_habitant, 1)} € par habitant en ${derniereAnnee}, contre ${formatNumber(comparaison('associations').strate_par_habitant, 1)} € dans les communes de même taille.`,
    );
  }
  faits.push(`Le conseil municipal compte ${formatNumber(conseil.femmes)} femmes et ${formatNumber(conseil.hommes)} hommes, pour ${formatNumber(conseil.nb_elus)} élus.`);
  if (premiereProfession) {
    faits.push(`Parmi les élus, la catégorie professionnelle la plus représentée est « ${premiereProfession.categorie.toLowerCase()} » (${formatNumber(premiereProfession.elus)} élus sur ${formatNumber(conseil.nb_elus)}).`);
  }
  if (appelsOffres.length > 0) {
    const annees = new Set(appelsOffres.map((a) => a.annee));
    faits.push(`La mairie a publié ${formatNumber(appelsOffres.length)} appels d'offres au bulletin officiel (BOAMP) sur ${formatNumber(annees.size)} années différentes.`);
  }
  if (marches.length > 0) {
    faits.push(`Les marchés publics de la commune ne figurent dans la base nationale que depuis que la mairie a commencé à y publier ses données : ${formatNumber(marches.length)} marchés à ce jour.`);
  }
  return faits;
}
