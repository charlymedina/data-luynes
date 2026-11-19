/**
 * Anecdotes « Le saviez-vous ? » du thème Revenus & emploi, calculées à partir des données INSEE.
 */
import { creations, resumeRevenus, trajets } from '../data/revenus';
import { formatNumber, formatRank } from './format';

/** Pourcentage → « X sur 10 » arrondi, pour une formule parlante (82 % → « 8 sur 10 »). */
export function surDix(pourcent: number): string {
  return `${formatNumber(Math.round(pourcent / 10))} sur 10`;
}

export function faitsRevenus(): string[] {
  const r = resumeRevenus;
  const record = creations.reduce((a, b) => (b.creations > a.creations ? b : a), creations[0] ?? { annee: 0, creations: 0 });
  const liste = [
    `La moitié des Luynois vit avec plus de ${formatNumber(Math.round(r.niveau_vie / 12 / 10) * 10)} € par mois (niveau de vie médian ${r.annee_revenus}) : ${formatRank(r.rang_niveau_vie)} commune d'Indre-et-Loire sur ${r.nb_communes_niveau_vie}.`,
    `${surDix(r.part_travail_ailleurs)} Luynois en emploi travaillent dans une autre commune ; ${formatNumber(Math.round(trajets.dans_la_commune))} % seulement travaillent à Luynes.`,
    `${surDix(r.part_voiture)} actifs luynois vont travailler en voiture, contre ${surDix(r.part_voiture_france)} en France.`,
    `Le taux de pauvreté est de ${formatNumber(r.pauvrete, 1)} % à Luynes, contre ${formatNumber(r.pauvrete_37, 1)} % en Indre-et-Loire.`,
  ];
  if (record.annee > 0) {
    liste.push(`Année record pour les créations d'entreprises à Luynes : ${record.annee}, avec ${formatNumber(record.creations)} nouvelles entreprises.`);
  }
  if (r.salaire_hommes > r.salaire_femmes) {
    const ecart = Math.round((100 * (r.salaire_hommes - r.salaire_femmes)) / r.salaire_hommes);
    liste.push(`Dans le privé, le salaire net moyen des femmes est inférieur de ${formatNumber(ecart)} % à celui des hommes (données ${r.annee_salaires}, équivalent temps plein).`);
  }
  return liste;
}
