/**
 * Anecdotes « Le saviez-vous ? » du thème « Vie quotidienne », calculées à partir des données (jamais écrites à la main).
 * Ton neutre : on décrit ce qui est au-dessus ET en dessous du département.
 */
import { anneesCovoiturage, dernierTrimestreFibre, libelleTrimestre, premierTrimestreFibre, resumeDae as d, resumeFibre as f, resumeMobilier as m, trimestresFibre } from '../data/quotidien';
import { formatNumber, formatOneDecimal, formatRankOf } from './format';

export function faitsQuotidien(): string[] {
  const liste: string[] = [];
  const points = (v: number): string => `${v > 0 ? '+' : ''}${formatOneDecimal(v)} points`;

  liste.push(
    `Au ${dernierTrimestreFibre}, ${formatNumber(f.fibre)} des ${formatNumber(f.locaux)} locaux de Luynes recensés par l'ARCEP peuvent être raccordés à la fibre : ${formatOneDecimal(f.fibre_pct)} %, contre ${formatOneDecimal(f.fibre_pct_37)} % en Indre-et-Loire (${formatRankOf(f.rang, f.nb_communes)}).`,
  );
  liste.push(
    `Entre ${premierTrimestreFibre} et ${dernierTrimestreFibre}, la part de locaux raccordables à la fibre est passée de ${formatOneDecimal(f.fibre_pct_debut)} % à ${formatOneDecimal(f.fibre_pct)} % à Luynes (${points(f.fibre_pct - f.fibre_pct_debut)}) et de ${formatOneDecimal(f.fibre_pct_37_debut)} % à ${formatOneDecimal(f.fibre_pct_37)} % en Indre-et-Loire (${points(f.fibre_pct_37 - f.fibre_pct_37_debut)}).`,
  );
  const plusGrosGain = trimestresFibre
    .slice(1)
    .map((t, i) => ({ t, gain: t.luynes_pct - (trimestresFibre[i]?.luynes_pct ?? t.luynes_pct), avant: trimestresFibre[i] }))
    .sort((a, b) => b.gain - a.gain)[0];
  if (plusGrosGain?.avant && plusGrosGain.gain > 0) {
    liste.push(`La plus forte hausse de la part de locaux raccordables à Luynes entre deux publications de l'ARCEP : ${points(plusGrosGain.gain)}, entre ${libelleTrimestre(plusGrosGain.avant)} et ${libelleTrimestre(plusGrosGain.t)}.`);
  }
  liste.push(
    `La base nationale Géo'DAE recense ${formatNumber(d.defibrillateurs)} défibrillateurs à Luynes, dont ${formatNumber(d.exterieurs)} posés à l'extérieur : ${formatOneDecimal(d.pour_1000)} pour 1 000 habitants, contre ${formatOneDecimal(d.pour_1000_37)} en Indre-et-Loire (${formatRankOf(d.rang, d.nb_communes)}).`,
  );
  liste.push(`${formatNumber(d.communes_sans)} communes d'Indre-et-Loire n'ont aucun défibrillateur enregistré dans la base Géo'DAE ; ce n'est pas le cas de Luynes.`);
  const pic = [...anneesCovoiturage].sort((a, b) => b.trajets - a.trajets)[0];
  const derniere = anneesCovoiturage.at(-1);
  if (pic && derniere) {
    liste.push(
      `Les trajets de covoiturage organisés par une plateforme et partis de Luynes ont atteint ${formatNumber(pic.trajets)} en ${pic.annee} ; ils sont ${formatNumber(derniere.trajets)} en ${derniere.annee} (${formatOneDecimal(derniere.pour_1000)} pour 1 000 habitants, contre ${formatOneDecimal(derniere.pour_1000_37)} en Indre-et-Loire).`,
    );
  }
  liste.push(
    `Luynes compte ${formatNumber(m.verre)} points d'apport volontaire du verre : un pour ${formatNumber(m.verre_habitants_par_point)} habitants, contre un pour ${formatNumber(m.verre_habitants_par_point_metropole)} dans l'ensemble des communes de Tours Métropole.`,
  );
  return liste;
}
