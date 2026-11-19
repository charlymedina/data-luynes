/**
 * Phrases « Le saviez-vous ? » construites à partir des données (aucun chiffre écrit à la main).
 * Si une donnée change au prochain recensement, la phrase suit automatiquement.
 */
import { commune, rang, voisines } from '../data/commune';
import { agesDe, derniereAnneeEtatCivil, faits, pyramide } from '../data/population';
import { formatNumber, formatOneIn, formatRank, formatRatio } from './format';

/** Écart femmes/hommes chez les plus âgés : seulement si l'écart est vraiment parlant. */
const RATIO_FEMMES_PARLANT = 1.5;

export function faitsCommune(): string[] {
  const faitsListe = [
    `Avec ${formatNumber(commune.densite_hab_km2)} habitants au km², Luynes est ${formatRatio(commune.densite_hab_km2, rang.densite_departement)} fois plus dense que la moyenne de l'Indre-et-Loire.`,
    `Luynes est la ${formatRank(rang.rang_population)} commune la plus peuplée du département… sur ${rang.nb_communes} !`,
  ];
  const plusGrande = voisines.find((v) => !v.est_luynes);
  if (plusGrande && plusGrande.population > commune.population) {
    faitsListe.push(
      `La voisine ${plusGrande.nom}, à ${formatNumber(plusGrande.distance_km, 1)} km, compte ${formatRatio(plusGrande.population, commune.population)} fois plus d'habitants que Luynes.`,
    );
  }
  return faitsListe;
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
  ];
  if (plusAges && plusAges.hommes > 0 && plusAges.femmes / plusAges.hommes >= RATIO_FEMMES_PARLANT) {
    liste.push(
      `Chez les ${plusAges.libelle.replace(' et +', ' et plus')}, on compte ${formatRatio(plusAges.femmes, plusAges.hommes)} femmes pour 1 homme.`,
    );
  }
  return liste;
}
