/**
 * Anecdotes « Le saviez-vous ? » du thème Sport, calculées à partir des données (jamais écrites à la main).
 * Ton neutre : on décrit ce qui est au-dessus ET ce qui est en dessous du département.
 */
import { equipements, federationsSportives, nomCourtFederation, nomPropre, resumeSport } from '../data/sport';
import { formatNumber, formatOneDecimal, formatRankOf } from './format';

/** Fédérations assez grandes (au moins 30 licences) pour que leur part de femmes ait un sens. */
const SEUIL_PARITE = 30;

const signe = (v: number): string => `${v > 0 ? '+' : ''}${formatOneDecimal(v)} %`;

export function faitsSport(): string[] {
  const r = resumeSport;
  const liste: string[] = [];
  const premiere = federationsSportives[0];

  liste.push(
    `${formatNumber(r.licences)} licences sportives sont rattachées à des habitants de Luynes en ${r.annee_fin}, réparties dans ${formatNumber(r.federations)} fédérations : ${formatOneDecimal(r.licences_pour_100)} pour 100 habitants, contre ${formatOneDecimal(r.licences_pour_100_37)} en Indre-et-Loire (${formatRankOf(r.rang_licences, r.nb_communes_licences)}).`,
  );
  if (premiere) {
    liste.push(
      `${nomCourtFederation(premiere.federation)} est la fédération qui compte le plus de licences à Luynes en ${r.annee_fin} : ${formatNumber(premiere.licences)}, soit autant que ${formatOneDecimal((100 * premiere.licences) / r.population)} habitants sur 100.`,
    );
  }
  const assez = federationsSportives.filter((f) => f.licences >= SEUIL_PARITE && f.femmes_pct !== null);
  const plusFeminine = [...assez].sort((a, b) => (b.femmes_pct ?? 0) - (a.femmes_pct ?? 0))[0];
  const plusMasculine = [...assez].sort((a, b) => (a.femmes_pct ?? 0) - (b.femmes_pct ?? 0))[0];
  if (plusFeminine && plusMasculine) {
    liste.push(
      `Parmi les fédérations de plus de ${SEUIL_PARITE} licences, la part de femmes va de ${formatOneDecimal(plusMasculine.femmes_pct ?? 0)} % (${nomCourtFederation(plusMasculine.federation)}) à ${formatOneDecimal(plusFeminine.femmes_pct ?? 0)} % (${nomCourtFederation(plusFeminine.federation)}).`,
    );
  }
  liste.push(
    `Entre ${r.annee_debut} et ${r.annee_fin}, le nombre de licences a évolué de ${signe(r.evolution_luynes_pct)} à Luynes et de ${signe(r.evolution_37_pct)} en Indre-et-Loire.`,
  );
  liste.push(
    `Le recensement des équipements sportifs compte ${formatNumber(r.equipements)} équipements dans ${formatNumber(r.installations)} installations à Luynes, soit ${formatOneDecimal(r.equipements_pour_1000)} pour 1 000 habitants (${formatOneDecimal(r.equipements_pour_1000_37)} en Indre-et-Loire).`,
  );
  const salles = new Set(equipements.filter((e) => /boules? de fort/i.test(e.installation)).map((e) => e.installation));
  if (salles.size > 0) {
    liste.push(`Luynes compte ${formatNumber(salles.size)} installation${salles.size > 1 ? 's' : ''} de boule de fort au recensement : ${[...salles].map(nomPropre).join(', ')}.`);
  }
  const datees = equipements.filter((e) => e.annee_service !== null);
  const plusAncien = [...datees].sort((a, b) => (a.annee_service ?? 0) - (b.annee_service ?? 0))[0];
  if (plusAncien) {
    liste.push(`Parmi les équipements dont l'année de mise en service est connue, le plus ancien date de ${plusAncien.annee_service} : ${nomPropre(plusAncien.nom)} (${nomPropre(plusAncien.installation)}).`);
  }
  return liste;
}
