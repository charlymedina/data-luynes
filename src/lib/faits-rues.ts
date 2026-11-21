/**
 * Anecdotes « Le saviez-vous ? » du thème « Les rues de Luynes », calculées à partir des données (jamais écrites à la main).
 * Ton neutre : on décrit ce qui est dans la base, sans jugement.
 */
import { categoriesHonorees, curiosites, resumeRues, typesDeVoies, voiesAilleurs } from '../data/rues';
import { formatNumber, formatOneDecimal } from './format';

const pluriel = (n: number, singulier: string, pluriel: string): string => (n > 1 ? pluriel : singulier);

export function faitsRues(): string[] {
  const r = resumeRues;
  const liste: string[] = [];

  liste.push(
    `La Base Adresse Nationale recense ${formatNumber(r.adresses)} adresses à Luynes, réparties sous ${formatNumber(r.noms)} noms : ${formatNumber(r.voies)} voies (rues, chemins, impasses, places…) et ${formatNumber(r.lieux_dits)} lieux-dits ou quartiers.`,
  );
  liste.push(
    `${formatOneDecimal((100 * r.adresses_lieux_dits) / r.adresses)} % des adresses de Luynes se trouvent dans un lieu-dit ou un quartier plutôt que dans une voie. Le plus peuplé : ${r.lieu_dit_plus_peuple} (${formatNumber(r.lieu_dit_plus_peuple_adresses)} adresses).`,
  );
  liste.push(
    `La voie qui compte le plus d'adresses est la ${r.voie_plus_peuplee.charAt(0).toLowerCase()}${r.voie_plus_peuplee.slice(1)} : ${formatNumber(r.voie_plus_peuplee_adresses)} adresses.`,
  );
  const premierType = typesDeVoies.find((t) => t.voie);
  if (premierType) {
    liste.push(
      `Le type de voie le plus répandu est « ${premierType.type.toLowerCase()} » : ${formatNumber(premierType.nombre)} voies sur ${formatNumber(r.voies)}, pour ${formatNumber(premierType.adresses)} adresses.`,
    );
  }
  liste.push(
    `${formatNumber(r.voies_de_personnes)} voies portent le nom d'une personne (${formatNumber(r.personnes_distinctes)} personnes différentes) : ${formatNumber(r.voies_hommes)} ${pluriel(r.voies_hommes, 'nom d\'homme', 'noms d\'hommes')}, ${formatNumber(r.voies_femmes)} ${pluriel(r.voies_femmes, 'nom de femme', 'noms de femmes')}${r.voies_sexe_indetermine > 0 ? ` et ${formatNumber(r.voies_sexe_indetermine)} sans sexe déterminé (prénom absent ou ambigu)` : ''}.`,
  );
  const ecrivains = categoriesHonorees.find((c) => c.categorie.startsWith('Écrivains'));
  if (ecrivains) {
    liste.push(
      `Les écrivains et poètes sont la catégorie la mieux représentée parmi les personnes honorées : ${formatNumber(ecrivains.voies)} voies pour ${formatNumber(ecrivains.personnes)} personnes. À l'inverse, ${formatNumber(r.voies_sans_categorie)} voies portent le nom d'une personne dont l'identité n'est pas établie avec certitude dans cette étude.`,
    );
  }
  const jumelles = voiesAilleurs.filter((v) => v.nature === 'ville_jumelle');
  if (jumelles.length > 0) {
    liste.push(`${formatNumber(jumelles.length)} voies rappellent des villes jumelées avec Luynes : ${jumelles.map((v) => `${v.sujet} (${v.description})`).join(', ')}.`);
  }
  if (curiosites.length > 0) {
    const exemples = curiosites.slice(0, 3).map((c) => `« ${c.nom} »`);
    liste.push(`Parmi les ${formatNumber(r.noms)} noms de voies et de lieux-dits, quelques-uns intriguent : ${exemples.join(', ')}…`);
  }
  return liste;
}
