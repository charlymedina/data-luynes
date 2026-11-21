/**
 * Anecdotes « Le saviez-vous ? » du thème Écoles, santé & services (BPE INSEE, Éducation nationale).
 */
import { cantinesEcoles, effectifsCollege, mediatheque, nombreDe, OBJECTIF_BIO, OBJECTIF_DURABLE, resumeEquipements } from '../data/equipements';
import { formatNumber } from './format';

export function faitsEquipements(): string[] {
  const r = resumeEquipements;
  const liste: string[] = [];
  if (r.evolution_eleves_pct < 0) {
    liste.push(
      `Les écoles de Luynes accueillent ${formatNumber(r.eleves)} élèves à la rentrée ${r.derniere_rentree}, contre ${formatNumber(r.eleves_premiere_rentree)} en ${r.premiere_rentree} : ${formatNumber(Math.abs(r.evolution_eleves_pct), 0)} % de moins (${formatNumber(r.evolution_eleves_37_pct, 0)} % dans le département).`,
    );
  }
  if (r.etablissements_sante > 0) {
    liste.push(`Luynes compte ${formatNumber(r.etablissements_sante)} établissements de soins (court séjour, soins de suite), ceux de son centre hospitalier.`);
  }
  if (r.medecins_pour_10000 > r.medecins_pour_10000_37) {
    liste.push(
      `${formatNumber(r.medecins)} médecins généralistes exercent à Luynes : ${formatNumber(r.medecins_pour_10000, 1)} pour 10 000 habitants, contre ${formatNumber(r.medecins_pour_10000_37, 1)} en Indre-et-Loire.`,
    );
  }
  const piscine = nombreDe('F101');
  if (piscine > 0) liste.push(`Luynes a sa piscine : la base des équipements de l'INSEE y recense ${formatNumber(piscine)} bassin de natation.`);
  liste.push(`La base des équipements de l'INSEE recense ${formatNumber(r.equipements)} commerces, services et équipements à Luynes en ${r.annee_bpe}.`);
  const college = effectifsCollege.at(-1);
  if (college) {
    liste.push(`Le collège de Luynes accueille ${formatNumber(college.eleves)} élèves à la rentrée ${college.rentree}, dont ${formatNumber(college.sixiemes)} en 6ᵉ.`);
  }
  if (mediatheque?.prets && mediatheque.prets_par_habitant !== null) {
    liste.push(`La médiathèque de Luynes a prêté ${formatNumber(mediatheque.prets)} documents en ${mediatheque.annee}, soit ${formatNumber(mediatheque.prets_par_habitant, 1)} par habitant.`);
  }
  if (cantinesEcoles) {
    const ecart = cantinesEcoles.bio_pct - OBJECTIF_BIO;
    liste.push(
      `Dans les cantines des écoles de Luynes, ${formatNumber(cantinesEcoles.bio_pct, 1)} % des achats sont bio (${cantinesEcoles.annee}) : ${ecart >= 0 ? 'au-dessus' : 'en dessous'} de l'objectif de ${OBJECTIF_BIO} % fixé par la loi EGalim, tandis que la part de produits durables et de qualité (${formatNumber(cantinesEcoles.durable_pct, 1)} %) est ${cantinesEcoles.durable_pct >= OBJECTIF_DURABLE ? 'au-dessus' : 'en dessous'} de l'objectif de ${OBJECTIF_DURABLE} %.`,
    );
  }
  return liste;
}
