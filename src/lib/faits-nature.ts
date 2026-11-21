/**
 * Anecdotes « Le saviez-vous ? » du thème Nature & paysages, calculées à partir des données (jamais écrites à la main).
 * Ton neutre et factuel ; les observations d'espèces sont toujours présentées comme des observations, pas comme un inventaire.
 */
import { appellations, especesMenacees, especesTop, famillesCultures, groupesVivants, nomZone, resumeBiodiversite as b, resumeNature as r, zonesProtegees } from '../data/nature';
import { formatNumber, formatOneDecimal } from './format';

const pluriel = (n: number, mot: string): string => `${formatNumber(n)} ${mot}${n > 1 ? 's' : ''}`;

export function faitsNature(): string[] {
  const liste: string[] = [];
  const natura = zonesProtegees.find((z) => z.type.startsWith('natura'));
  const znieff1 = zonesProtegees.filter((z) => z.type === 'znieff1');
  const plusGrande = zonesProtegees[0];

  liste.push(
    `${formatNumber(r.zonee_ha)} hectares de Luynes, soit ${formatOneDecimal(r.zonee_pct)} % de la commune, relèvent d'au moins une ZNIEFF ou d'un site Natura 2000 (en ne comptant qu'une fois les terrains qui relèvent de plusieurs zonages).`,
  );
  if (plusGrande) {
    liste.push(
      `Parmi les zonages qui touchent Luynes, « ${nomZone(plusGrande.nom)} » (${plusGrande.type_libelle}) est celui qui recouvre le plus de terrain dans la commune : ${formatOneDecimal(plusGrande.surface_ha)} hectares.`,
    );
  }
  if (znieff1.length > 0) {
    liste.push(`Luynes compte ${pluriel(znieff1.length, 'ZNIEFF de type I')} (secteurs de grand intérêt écologique) : ${znieff1.map((z) => nomZone(z.nom)).join(' et ')}.`);
  }
  if (natura) {
    liste.push(`Les sites Natura 2000 de Luynes sont désignés au titre de la directive Habitats (« ${nomZone(zonesProtegees.find((z) => z.type === 'natura_habitats')?.nom ?? natura.nom)} ») et de la directive Oiseaux (« ${nomZone(zonesProtegees.find((z) => z.type === 'natura_oiseaux')?.nom ?? natura.nom)} »).`);
  }
  const plusRepandue = famillesCultures[0];
  liste.push(
    `En ${r.annee_rpg}, ${formatNumber(r.agricole_ha)} hectares sont déclarés comme terres agricoles à Luynes (${formatOneDecimal(r.agricole_pct)} % de la commune), répartis entre ${formatNumber(r.nb_familles)} familles de cultures${plusRepandue ? ` ; la plus étendue est « ${plusRepandue.famille.toLowerCase()} » avec ${formatNumber(plusRepandue.surface_ha)} hectares` : ''}.`,
  );
  liste.push(`Les prairies permanentes couvrent ${formatNumber(r.prairies_ha)} hectares : environ ${formatOneDecimal(r.prairies_part_agricole_pct)} % de la surface agricole déclarée.`);
  liste.push(
    `Les terres déclarées au registre agricole couvraient ${formatNumber(r.agricole_ancienne_ha)} hectares en ${r.annee_rpg_ancienne} et ${formatNumber(r.agricole_ha)} en ${r.annee_rpg}. Les cultures tournent d'une année sur l'autre : seul l'ensemble se compare.`,
  );
  if (appellations.length > 0) {
    liste.push(
      `${formatNumber(r.aoc_ha)} hectares de Luynes sont délimités pour produire du vin sous AOC (${appellations.map((a) => a.appellation).join(', ')}), alors que ${formatOneDecimal(r.vignes_ha)} hectares de vignes sont déclarés en ${r.annee_rpg} : l'aire délimitée est un droit de produire, pas une surface plantée.`,
    );
  }
  liste.push(`${formatNumber(b.observations)} observations d'espèces ont été partagées sur Luynes, qui concernent ${formatNumber(b.especes)} espèces différentes. C'est le reflet de l'endroit où l'on regarde, pas un inventaire complet.`);
  const [premiere] = especesTop;
  if (premiere) {
    liste.push(`L'espèce la plus souvent observée à Luynes est ${premiere.espece} (${formatNumber(premiere.observations)} observations).`);
  }
  const oiseaux = groupesVivants.find((g) => g.groupe === 'Oiseaux');
  if (oiseaux) {
    liste.push(`Les oiseaux représentent ${formatOneDecimal(oiseaux.part_pct)} % des observations, les plantes ${formatOneDecimal(b.plantes_pct)} %.`);
  }
  if (especesMenacees.length > 0) {
    liste.push(
      `${pluriel(b.especes_menacees, 'espèce')} observée${b.especes_menacees > 1 ? 's' : ''} à Luynes figure${b.especes_menacees > 1 ? 'nt' : ''} dans les catégories « vulnérable », « en danger » ou « en danger critique » de la liste rouge mondiale de l'UICN (un statut mondial : une espèce peut être courante localement).`,
    );
  }
  return liste;
}
