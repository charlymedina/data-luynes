/**
 * Anecdotes « Le saviez-vous ? » du thème Construction & logement social, calculées à partir des données.
 */
import { resumeConstruction } from '../data/construction';
import { formatNumber } from './format';

export function faitsConstruction(): string[] {
  const r = resumeConstruction;
  const liste: string[] = [
    `De ${r.annee_debut} à ${r.annee_fin}, ${formatNumber(r.commences_total)} logements ont été mis en chantier à Luynes, soit environ ${formatNumber(Math.round(r.commences_par_an))} par an.`,
    `L'année record est ${r.annee_record}, avec ${formatNumber(r.commences_record)} logements mis en chantier.`,
    `Luynes compte ${formatNumber(r.logements_sociaux)} logements sociaux, d'une surface moyenne de ${formatNumber(r.surface_moyenne_sociaux)} m².`,
  ];
  if (r.sociaux_recents > 0) {
    liste.push(`${formatNumber(r.sociaux_recents)} logements sociaux de Luynes ont été construits ces 10 dernières années.`);
  }
  return liste;
}
