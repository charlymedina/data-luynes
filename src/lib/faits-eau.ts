/**
 * Anecdotes « Le saviez-vous ? » du thème Eau potable, calculées à partir des données (jamais écrites à la main).
 */
import { LIMITE_NITRATES, resumeEau, resumePompage } from '../data/eau';
import { formatNumber, formatOneDecimal, formatRankOf } from './format';

export function faitsEau(): string[] {
  const r = resumeEau;
  const liste: string[] = [
    `Depuis ${r.annee_debut}, l'eau du robinet de Luynes a été prélevée et analysée ${formatNumber(r.prelevements)} fois par le contrôle sanitaire.`,
  ];
  if (r.nitrates_luynes > 0 && r.nitrates_37 > r.nitrates_luynes) {
    liste.push(
      `Avec ${formatOneDecimal(r.nitrates_luynes)} mg/L de nitrates en moyenne (${r.fenetre_debut}-${r.fenetre_fin}), l'eau de Luynes en contient moins que la moyenne des analyses d'Indre-et-Loire (${formatOneDecimal(r.nitrates_37)} mg/L).`,
    );
  }
  liste.push(
    `Le plus haut taux de nitrates mesuré à Luynes sur ${r.fenetre_debut}-${r.fenetre_fin} est de ${formatOneDecimal(r.nitrates_max_luynes)} mg/L, pour une limite sanitaire de ${LIMITE_NITRATES} mg/L.`,
    `Pour les nitrates, l'eau de Luynes se classe ${formatRankOf(r.rang_nitrates, r.nb_communes_nitrates)} (1ʳᵉ = la plus chargée).`,
  );
  if (r.non_conformes_pc === 0) {
    liste.push(`Aucun prélèvement à Luynes n'a dépassé une limite sanitaire physico-chimique (nitrates, métaux, pesticides…) depuis ${r.annee_debut}.`);
  }
  const p = resumePompage;
  const piscines = Math.round(p.potable_m3 / p.m3_piscine_olympique);
  liste.push(
    `En ${p.annee}, ${formatNumber(p.potable_m3)} m³ d'eau potable ont été puisés dans le sous-sol de Luynes, soit l'équivalent de ${formatNumber(piscines)} piscines olympiques.`,
  );
  if (p.potable_m3 > p.potable_m3_debut) {
    liste.push(`Le volume d'eau potable puisé à Luynes est passé de ${formatNumber(p.potable_m3_debut)} m³ en ${p.annee_debut} à ${formatNumber(p.potable_m3)} m³ en ${p.annee}.`);
  }
  return liste;
}
