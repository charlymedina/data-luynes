/**
 * Anecdotes « Le saviez-vous ? » du thème Délinquance, calculées à partir des données.
 * Ton factuel et sobre : on compare des taux sur 3 ans, sans mise en avant anxiogène.
 */
import { indicateursDelinquance, indicateursPublies, periodeDelinquance, serieDe } from '../data/delinquance';
import { formatNumber } from './format';

export function faitsDelinquance(): string[] {
  const liste: string[] = [];
  const { debut, fin } = periodeDelinquance;
  const sousLaMoyenne = indicateursPublies.filter((i) => i.taux_luynes < i.taux_37);

  if (indicateursPublies.length > 0) {
    liste.push(
      `Sur ${debut}-${fin}, Luynes est sous la moyenne de l'Indre-et-Loire pour ${formatNumber(sousLaMoyenne.length)} des ${formatNumber(indicateursPublies.length)} indicateurs de délinquance publiés pour la commune.`,
    );
  }

  // Indicateurs jamais enregistrés à Luynes sur toute la série publiée (aucun fait, chaque année)
  const jamais = indicateursDelinquance.filter((i) => {
    const serie = serieDe(i.indicateur);
    return serie.length > 0 && serie.every((a) => a.diffuse && a.nombre === 0);
  });
  const premiereAnnee = serieDe(indicateursDelinquance[0]?.indicateur ?? '')[0]?.annee;
  if (jamais.length > 0 && premiereAnnee) {
    liste.push(
      `Aucun fait de type « ${jamais.map((i) => i.libelle.toLowerCase()).join(' » ni « ')} » n'a été enregistré à Luynes de ${premiereAnnee} à ${fin}.`,
    );
  }

  const vols = indicateursPublies.find((i) => i.indicateur === 'Vols sans violence contre des personnes');
  if (vols && vols.taux_luynes < vols.taux_france) {
    liste.push(
      `Les vols sans violence contre des personnes sont rares à Luynes :${formatNumber(vols.taux_luynes, 1)} pour 1 000 habitants par an, contre ${formatNumber(vols.taux_france, 1)} en France.`,
    );
  }
  return liste;
}
