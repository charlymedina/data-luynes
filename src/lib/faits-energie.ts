/**
 * Anecdotes « Le saviez-vous ? » du thème Énergie & mobilité, calculées à partir des données.
 */
import { anneesParc, resumeEnergie } from '../data/energie';
import { formatNumber, formatRankOf, formatRatio } from './format';

/** En dessous de cette part, une proportion « 1 sur N » devient trop abstraite : on garde le pourcentage. */
const PART_MIN_UN_SUR = 1;

export function faitsEnergie(): string[] {
  const r = resumeEnergie;
  const liste: string[] = [];
  const debut = anneesParc[0];

  if (r.part_electrique_pct >= PART_MIN_UN_SUR) {
    liste.push(
      `Au 1er janvier ${r.annee_parc}, environ 1 voiture luynoise sur ${formatNumber(Math.round(100 / r.part_electrique_pct))} est électrique (${formatNumber(r.part_electrique_pct, 1)} %, contre ${formatNumber(r.part_electrique_37_pct, 1)} % en Indre-et-Loire) : ${formatRankOf(r.rang_electrique, r.nb_communes_parc)}.`,
    );
  }
  if (r.part_diesel_pct < r.part_diesel_debut_pct) {
    liste.push(
      `Le diesel recule : ${formatNumber(r.part_diesel_debut_pct, 0)} % des voitures de Luynes roulaient au gazole en ${r.annee_parc_debut}, ${formatNumber(r.part_diesel_pct, 0)} % en ${r.annee_parc}.`,
    );
  }
  if (debut && debut.electrique === 0) {
    liste.push(`En ${debut.annee}, aucune voiture électrique n'était immatriculée à Luynes. Au 1er janvier ${r.annee_parc}, il y en a ${formatNumber(anneesParc.at(-1)?.electrique ?? 0)}.`);
  }
  if (r.solaire_kw > 0) {
    liste.push(
      `${formatNumber(r.solaire_installations)} installations solaires sont raccordées au réseau à Luynes, pour ${formatNumber(r.solaire_kw)} kW de puissance au total.`,
    );
  }
  if (r.elec_mwh_par_logement > r.elec_mwh_par_logement_37) {
    liste.push(
      `Un logement luynois consomme en moyenne ${formatNumber(r.elec_mwh_par_logement * 1000)} kWh d'électricité par an, soit ${formatRatio(r.elec_mwh_par_logement, r.elec_mwh_par_logement_37)} fois la moyenne de l'Indre-et-Loire (${formatNumber(r.elec_mwh_par_logement_37 * 1000)} kWh).`,
    );
  }
  return liste;
}
