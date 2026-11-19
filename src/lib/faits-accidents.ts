/**
 * Anecdotes « Le saviez-vous ? » du thème Accidents de la route, calculées à partir des données BAAC.
 * Ton factuel : aucune donnée sur les personnes, seulement des comptes et des comparaisons.
 */
import { anneesAccidents, resumeAccidents, routesAccidents } from '../data/accidents';
import { formatNumber, formatRatio } from './format';

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
    liste.push(`Aucun accident corporel n'a été recensé à Luynes en ${derniere.annee}.`);
  }
  if (route) {
    liste.push(`La ${route.route} est la route de Luynes qui a compté le plus d'accidents corporels depuis ${r.annee_debut} : ${formatNumber(route.accidents)}.`);
  }
  if (r.part_graves_luynes > r.part_graves_37) {
    liste.push(
      `À Luynes, ${formatNumber(Math.round(r.part_graves_luynes / 10))} accidents sur 10 font au moins un blessé hospitalisé ou un mort, contre ${formatNumber(Math.round(r.part_graves_37 / 10))} sur 10 dans le département.`,
    );
  }
  return liste;
}
