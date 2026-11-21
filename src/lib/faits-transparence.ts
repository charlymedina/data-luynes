/**
 * Anecdotes « Le saviez-vous ? » du thème Transparence, calculées à partir des données publiques
 * (aucun chiffre écrit à la main). Ton strictement factuel : on décrit, on ne juge pas.
 */
import {
  anneesElus,
  anneesSubventions,
  comparaison,
  conseil,
  derniereAnnee,
  lignesDepenses,
  marches,
  premiereAnnee,
  professions,
  appelsOffres,
} from '../data/transparence';
import { formatNumber } from './format';

const euros = (v: number): string => `${formatNumber(v)} €`;

export function faitsTransparence(): string[] {
  const personnel = lignesDepenses.find((l) => l.annee === derniereAnnee && l.poste === 'personnel');
  const elus = anneesElus.find((a) => a.annee === derniereAnnee);
  const elusDebut = anneesElus.find((a) => a.annee === premiereAnnee);
  const asso = anneesSubventions.find((a) => a.annee === derniereAnnee);
  const comparaisonAsso = comparaison('associations');
  const comparaisonElus = comparaison('indemnites');
  const premiereProfession = professions[0];
  const anneesAvecAppel = new Set(appelsOffres.map((a) => a.annee));
  const faits: string[] = [];

  if (personnel) {
    faits.push(`En ${derniereAnnee}, ${formatNumber(Math.round(personnel.pour_100_euros))} € sur 100 € de dépenses de fonctionnement ont servi à payer le personnel communal.`);
  }
  if (elus && elusDebut) {
    faits.push(
      `En ${derniereAnnee}, les indemnités des élus représentent ${formatNumber(elus.indemnites_par_habitant, 1)} € par habitant, contre ${formatNumber(comparaisonElus.strate_par_habitant, 1)} € en moyenne dans les communes de même taille.`,
    );
    faits.push(`Les indemnités des élus de Luynes étaient de ${euros(elusDebut.indemnites)} en ${premiereAnnee} et de ${euros(elus.indemnites)} en ${derniereAnnee}.`);
  }
  if (asso) {
    faits.push(
      `Les subventions aux associations représentent ${formatNumber(asso.associations_par_habitant, 1)} € par habitant en ${derniereAnnee}, contre ${formatNumber(comparaisonAsso.strate_par_habitant, 1)} € dans les communes de même taille.`,
    );
  }
  faits.push(`Le conseil municipal compte ${formatNumber(conseil.femmes)} femmes et ${formatNumber(conseil.hommes)} hommes, pour ${formatNumber(conseil.nb_elus)} élus.`);
  if (premiereProfession) {
    faits.push(`Parmi les élus, la catégorie professionnelle la plus représentée est « ${premiereProfession.categorie.toLowerCase()} » (${formatNumber(premiereProfession.elus)} élus sur ${formatNumber(conseil.nb_elus)}).`);
  }
  if (appelsOffres.length > 0) {
    faits.push(`La mairie a publié ${formatNumber(appelsOffres.length)} appels d'offres au bulletin officiel (BOAMP) sur ${formatNumber(anneesAvecAppel.size)} années différentes.`);
  }
  if (marches.length > 0) {
    faits.push(`Les marchés publics de la commune ne figurent dans la base nationale que depuis que la mairie a commencé à y publier ses données : ${formatNumber(marches.length)} marchés à ce jour.`);
  }
  return faits;
}
