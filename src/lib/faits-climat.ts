/**
 * Anecdotes « Le saviez-vous ? » du thème Climat, calculées à partir des relevés Météo-France de Tours.
 */
import { MOIS_LONGS, formatJour, moisClimat, resumeClimat } from '../data/climat';
import { formatNumber, formatRatio } from './format';

export function faitsClimat(): string[] {
  const r = resumeClimat;
  const plusArrose = moisClimat.reduce((a, b) => (b.pluie > a.pluie ? b : a), moisClimat[0] ?? { mois: 1, pluie: 0, temperature_min: 0, temperature_max: 0 });
  const liste = [
    `Il fait en moyenne ${formatNumber(r.rechauffement, 1)} °C de plus à Tours sur ${r.recent_debut}-${r.recent_fin} qu'au début des mesures (${r.avant_debut}-${r.avant_fin}).`,
    `Record de chaleur à Tours : ${formatNumber(r.record_chaleur, 1)} °C le ${formatJour(r.record_chaleur_jour)}.`,
    `Record de froid à Tours : ${formatNumber(r.record_froid, 1)} °C le ${formatJour(r.record_froid_jour)}.`,
    `${formatNumber(r.annees_recentes_dans_top10)} des 10 années les plus chaudes mesurées à Tours depuis ${r.premiere_annee_mesures} sont postérieures à ${r.recent_debut - 1}.`,
    `${r.annee_plus_chaude} est l'année la plus chaude jamais mesurée à Tours (${formatNumber(r.temperature_annee_plus_chaude, 1)} °C de moyenne).`,
    `Le mois le plus arrosé à Tours, en moyenne, est ${MOIS_LONGS[plusArrose.mois - 1]} (${formatNumber(plusArrose.pluie)} mm).`,
  ];
  if (r.jours_chaleur_avant > 0 && r.jours_chaleur_recent > r.jours_chaleur_avant) {
    liste.push(
      `Les journées à 30 °C ou plus sont ${formatRatio(r.jours_chaleur_recent, r.jours_chaleur_avant)} fois plus fréquentes à Tours qu'au début des mesures : ${formatNumber(r.jours_chaleur_recent)} par an contre ${formatNumber(r.jours_chaleur_avant)}.`,
    );
  }
  if (r.jours_gel_recent < r.jours_gel_avant) {
    liste.push(`Il gèle ${formatNumber(r.jours_gel_avant - r.jours_gel_recent)} jours de moins par an à Tours qu'au début des mesures.`);
  }
  return liste;
}
