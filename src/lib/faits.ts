/**
 * Phrases « Le saviez-vous ? » construites à partir des données (aucun chiffre écrit à la main).
 * Si une donnée change au prochain recensement, la phrase suit automatiquement.
 */
import { commune, rang } from '../data/commune';
import { agesDe, derniereAnneeEtatCivil, faits, pyramide } from '../data/population';
import { monuments, resumeObjets, resumeRisques, zoneInondable } from '../data/patrimoine';
import { etiquettesDpe, loyerMaison, resumeImmobilier } from '../data/immobilier';
import {
  COMMUNES_37_COMPARABLES,
  formatCommunes,
  formatNumber,
  formatOneIn,
  formatPercent,
  formatRank,
  formatRankOf,
  formatRatio,
} from './format';

/** Écart femmes/hommes chez les plus âgés : seulement si l'écart est vraiment parlant. */
const RATIO_FEMMES_PARLANT = 1.5;

/**
 * Part des communes devant lesquelles Luynes se classe (ex. rang 46 sur 272 → 83 %).
 * Par défaut sur les 272 communes du département ; `total` pour un classement restreint (ex. communes
 * avec assez de ventes immobilières).
 */
export function partDevancee(rangLuynes: number, total: number = rang.nb_communes): number {
  return Math.round((100 * (total - rangLuynes)) / total);
}

/** « +3,8 % » / « −3,7 % » */
export function formatVariation(pct: number): string {
  return `${pct > 0 ? '+' : pct < 0 ? '−' : ''}${formatPercent(Math.abs(pct))}`;
}

export function faitsCommune(): string[] {
  return [
    `Avec ${formatNumber(commune.densite_hab_km2)} habitants au km², Luynes est ${formatRatio(commune.densite_hab_km2, rang.densite_departement)} fois plus dense que l'Indre-et-Loire dans son ensemble (${formatNumber(rang.densite_departement)} hab./km²).`,
    `Luynes est la ${formatRank(rang.rang_population)} commune la plus peuplée… sur les ${formatCommunes(rang.nb_communes)} !`,
    `Avec ${formatNumber(commune.surface_km2, 1)} km², Luynes est plus grande que ${partDevancee(rang.rang_surface)} % des communes d'Indre-et-Loire (la moitié d'entre elles font moins de ${formatNumber(rang.surface_mediane_km2, 1)} km²).`,
    `En densité, Luynes se classe ${formatRankOf(rang.rang_densite, rang.nb_communes)} : plus dense que ${partDevancee(rang.rang_densite)} % des communes du département.`,
  ];
}

/** Anecdotes qui comparent Luynes aux autres communes du département (population et âges). */
function faitsPopulationDepartement(): string[] {
  const liste = [
    `Pour la part des 65 ans et plus, Luynes se classe ${formatRankOf(rang.rang_65_plus, rang.nb_communes)}.`,
  ];
  const sensInverse = rang.evolution_pct < 0 && rang.evolution_departement_pct > 0;
  if (sensInverse) {
    liste.push(
      `Entre ${rang.annee_debut} et ${rang.annee_fin}, Luynes a perdu ${formatPercent(-rang.evolution_pct)} de ses habitants, alors que l'Indre-et-Loire en gagnait ${formatPercent(rang.evolution_departement_pct)}.`,
    );
  }
  return liste;
}

/** Anecdotes « Patrimoine & risques » (monuments, cavités, catastrophes naturelles). */
export function faitsPatrimoine(): string[] {
  const r = resumeRisques;
  const plusAncien = monuments[0];
  const liste = [
    `Avec ${formatNumber(r.monuments)} monuments historiques, Luynes se classe ${formatRankOf(r.rang_monuments, r.nb_communes)} (${formatNumber(r.moyenne_monuments_departement, 1)} en moyenne).`,
    `${formatNumber(r.cavites)} cavités souterraines sont recensées à Luynes : ${formatRatio(r.cavites, r.moyenne_cavites_departement)} fois la moyenne des communes du département. Le tuffeau du coteau a été creusé de toutes parts !`,
    `Depuis ${r.catnat_premiere_annee}, ${formatNumber(r.catnat)} événements ont été reconnus « catastrophe naturelle » à Luynes (par ${formatNumber(r.catnat_arretes)} arrêtés), dont ${formatNumber(r.catnat_secheresse)} sécheresses : Luynes se classe ${formatRankOf(r.rang_catnat, r.nb_communes)} pour le nombre de reconnaissances.`,
    `Le plus ancien mouvement de terrain recensé à Luynes date de ${r.mouvement_plus_ancien}.`,
    `${formatPercent(zoneInondable.part_commune_pct)} de la commune (${formatNumber(zoneInondable.surface_ha)} hectares) est en zone inondable de la Loire, entre le coteau et le fleuve.`,
  ];
  const o = resumeObjets;
  liste.push(
    `En plus des édifices, ${formatNumber(o.objets)} objets ou ensembles mobiliers de Luynes sont protégés au titre des monuments historiques, du ${o.siecle_min}ᵉ au ${o.siecle_max}ᵉ siècle.`,
    `${formatNumber(o.objets_lieu_principal)} des ${formatNumber(o.objets)} objets protégés de Luynes sont conservés dans un même lieu : « ${o.lieu_principal.toLowerCase()} ».`,
  );
  if (plusAncien) {
    liste.unshift(`« ${plusAncien.nom} » : c'est le premier monument de Luynes protégé au titre des monuments historiques, dès ${plusAncien.annee_protection} !`);
  }
  return liste;
}

/** Anecdotes « Immobilier » (ventes DVF, loyers, étiquettes énergie). */
export function faitsImmobilier(): string[] {
  const r = resumeImmobilier;
  const nbAnnees = r.annee_fin - r.annee_debut + 1;
  const passoire = (cle: 'part_luynes' | 'part_37'): number =>
    etiquettesDpe.filter((e) => e.etiquette === 'F' || e.etiquette === 'G').reduce((somme, e) => somme + e[cle], 0);
  const liste = [
    `Une maison se vend ${formatNumber(r.prix_maison)} € à Luynes (prix médian ${r.annee_debut_prix}-${r.annee_fin}), contre ${formatNumber(r.prix_maison_37)} € en Indre-et-Loire.`,
    `Au m², une maison coûte ${formatNumber(r.prix_m2_maison)} € à Luynes (${r.annee_debut_prix}-${r.annee_fin}) : ${formatRank(r.rang_prix_m2_maison)} commune la plus chère sur ${formatCommunes(r.nb_communes_classees, COMMUNES_37_COMPARABLES)} (celles qui ont assez de ventes).`,
    `En ${nbAnnees} ans, ${formatNumber(r.ventes)} biens ont changé de mains à Luynes, pour ${formatNumber(r.montant_total / 1_000_000)} millions d'euros au total.`,
    `La maison la plus chère vendue à Luynes depuis ${r.annee_debut} est partie à ${formatNumber(r.maison_la_plus_chere)} €.`,
    `La maison « type » vendue à Luynes : ${formatNumber(r.surface_maison)} m² habitables sur ${formatNumber(r.terrain_maison)} m² de terrain.`,
    `${formatPercent(passoire('part_luynes'))} des logements diagnostiqués à Luynes sont des « passoires thermiques » (étiquette F ou G), contre ${formatPercent(passoire('part_37'))} en Indre-et-Loire.`,
  ];
  if (loyerMaison) {
    liste.push(
      `Louer une maison de 100 m² à Luynes coûte environ ${formatNumber(Math.round(loyerMaison.loyer_m2 * 10) * 10)} € par mois, charges comprises (annonces ${loyerMaison.annee}).`,
    );
  }
  return liste;
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
    ...faitsPopulationDepartement(),
  ];
  if (plusAges && plusAges.hommes > 0 && plusAges.femmes / plusAges.hommes >= RATIO_FEMMES_PARLANT) {
    liste.push(
      `Chez les ${plusAges.libelle.replace(' et +', ' et plus')}, on compte ${formatRatio(plusAges.femmes, plusAges.hommes)} femmes pour 1 homme. Luynes accueille un EHPAD et des unités de long séjour (centre hospitalier Jean-Pagès), dont les résidents comptent parmi les habitants.`,
    );
  }
  return liste;
}
