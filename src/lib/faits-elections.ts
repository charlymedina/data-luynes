/**
 * Anecdotes « Le saviez-vous ? » du thème Élections, calculées à partir des données.
 * Règle de neutralité : elles ne portent que sur la participation, les inscrits et les bureaux de vote,
 * jamais sur les résultats des candidats ou des listes.
 */
import { dernierDe, resumeElections } from '../data/elections';
import { formatNumber, formatRankOf } from './format';

/** « Présidentielle » → « la présidentielle », « Régionales » → « les régionales » */
function avecArticle(type: string): string {
  const minuscule = type.toLowerCase();
  return minuscule.endsWith('s') ? `les ${minuscule}` : `la ${minuscule}`;
}

export function faitsElections(): string[] {
  const r = resumeElections;
  const liste: string[] = [];
  const pres = dernierDe('pres');
  const muni = dernierDe('muni');

  if (pres) {
    liste.push(
      `Au 1er tour de la présidentielle ${pres.annee}, ${formatNumber(Math.round(pres.participation_luynes))} électeurs luynois sur 100 sont allés voter, contre ${formatNumber(Math.round(pres.participation_france))} sur 100 en France.`,
    );
  }
  liste.push(
    `Record de participation à Luynes depuis ${r.premiere_annee} : ${formatNumber(r.record_haut_participation, 1)} % au 1er tour de ${avecArticle(r.record_haut_type)} ${r.record_haut_annee}.`,
  );
  if (r.fois_au_dessus_france > r.nb_premiers_tours / 2) {
    liste.push(
      `Depuis ${r.premiere_annee}, Luynes a voté plus que la moyenne nationale à ${formatNumber(r.fois_au_dessus_france)} premiers tours sur ${formatNumber(r.nb_premiers_tours)}.`,
    );
  }
  if (muni) {
    liste.push(
      `Aux municipales ${muni.annee}, ${formatNumber(muni.participation_luynes, 1)} % des inscrits ont voté au 1er tour à Luynes, contre ${formatNumber(muni.participation_37, 1)} % en Indre-et-Loire : ${formatRankOf(muni.rang, muni.nb_communes)}.`,
    );
  }
  liste.push(
    `${formatNumber(r.inscrits)} électeurs sont inscrits sur les listes de Luynes, répartis dans ${formatNumber(r.bureaux)} bureaux de vote (${avecArticle(r.dernier_type)} ${r.derniere_annee}).`,
  );
  return liste;
}
