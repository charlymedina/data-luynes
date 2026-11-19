/**
 * Anecdotes « Le saviez-vous ? » du thème Accidents de la route, calculées à partir des données BAAC.
 * Ton factuel : aucune donnée sur les personnes, seulement des comptes et des comparaisons.
 */
import { anneesAccidents, publicationDerniereAnnee, resumeAccidents, routesAccidents } from '../data/accidents';
import { formatMonthYear, formatNumber, formatRatio } from './format';

export function faitsAccidents(): string[] {
  const r = resumeAccidents;
  const liste: string[] = [];
  const route = routesAccidents.find((x) => !x.est_autres);
  const derniere = anneesAccidents.at(-1);

  if (r.taux_luynes > 0 && r.taux_37 > r.taux_luynes) {
    liste.push(
      `Rapporté au nombre d'habitants, il y a ${formatRatio(r.taux_37, r.taux_luynes)} fois moins d'accidents corporels à Luynes qu'en moyenne en Indre-et-Loire (${r.annee_debut}-${r.annee_fin}).`,
    );
  }
  if (r.annees_sans_accident > 0) {
    liste.push(`Depuis ${r.annee_debut}, Luynes a connu ${formatNumber(r.annees_sans_accident)} années sans aucun accident corporel sur ses routes.`);
  }
  if (derniere && derniere.accidents === 0) {
    const source = publicationDerniereAnnee ? ` (d'après le fichier national publié en ${formatMonthYear(publicationDerniereAnnee)})` : '';
    liste.push(`Aucun accident corporel n'a été recensé à Luynes en ${derniere.annee}${source}.`);
  }
  if (route) {
    liste.push(`La ${route.route} est la route de Luynes qui a compté le plus d'accidents corporels depuis ${r.annee_debut} : ${formatNumber(route.accidents)}.`);
  }
  return liste;
}
