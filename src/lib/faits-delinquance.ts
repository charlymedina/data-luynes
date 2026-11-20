/**
 * Textes du thème Délinquance, calculés à partir des données.
 * Ton factuel et équilibré : on dit ce qui est sous ET au-dessus de la moyenne, et les hausses récentes,
 * sans mise en avant anxiogène.
 */
import {
  haussesRecentes,
  indicateursDelinquance,
  indicateursDessus37,
  indicateursPublies,
  indicateursSansFait,
  indicateursSous37,
  periodeDelinquance,
  serieDe,
} from '../data/delinquance';
import { formatNumber } from './format';

const minuscule = (texte: string): string => texte.charAt(0).toLowerCase() + texte.slice(1);
const liste = (mots: string[]): string =>
  mots.length <= 1 ? (mots[0] ?? '') : `${mots.slice(0, -1).join(', ')} et ${mots.at(-1) ?? ''}`;

/** Bilan équilibré : sous la moyenne (dont sans aucun fait), et au-dessus. */
export function syntheseDelinquance(): string {
  const { debut, fin } = periodeDelinquance;
  const sansFait = indicateursSansFait.length;
  const dessus = indicateursDessus37.map((i) => minuscule(i.libelle));
  const debutPhrase = `Sur ${debut}-${fin}, Luynes est sous la moyenne de l'Indre-et-Loire pour ${formatNumber(indicateursSous37.length)} des ${formatNumber(indicateursPublies.length)} indicateurs publiés pour la commune`;
  const precisionZero = sansFait > 0 ? ` (dont ${formatNumber(sansFait)} sans aucun fait enregistré)` : '';
  const finPhrase = dessus.length > 0 ? `, et au-dessus pour ${liste(dessus)}.` : '.';
  return `${debutPhrase}${precisionZero}${finPhrase}`;
}

/** Hausses nettes de la dernière année, ou chaîne vide s'il n'y en a pas. */
export function phraseHausses(): string {
  const premiere = haussesRecentes[0];
  if (!premiere) return '';
  const details = haussesRecentes.map(
    (h) => `${minuscule(h.indicateur.libelle)} (${formatNumber(h.nombre)} faits, contre ${formatNumber(h.moyenneAvant, 1)} par an les deux années précédentes)`,
  );
  return `En ${premiere.annee}, hausse nette pour ${liste(details)}.`;
}

export function faitsDelinquance(): string[] {
  const faits: string[] = [];
  const { fin } = periodeDelinquance;

  if (indicateursPublies.length > 0) faits.push(syntheseDelinquance());

  // Indicateurs jamais enregistrés à Luynes sur toute la série publiée (aucun fait, chaque année)
  const jamais = indicateursDelinquance.filter((i) => {
    const serie = serieDe(i.indicateur);
    return serie.length > 0 && serie.every((a) => a.diffuse && a.nombre === 0);
  });
  const premiereAnnee = serieDe(indicateursDelinquance[0]?.indicateur ?? '')[0]?.annee;
  if (jamais.length > 0 && premiereAnnee) {
    faits.push(
      `Aucun fait de type « ${jamais.map((i) => minuscule(i.libelle)).join(' » ni « ')} » n'a été enregistré à Luynes de ${premiereAnnee} à ${fin}.`,
    );
  }

  const vols = indicateursPublies.find((i) => i.indicateur === 'Vols sans violence contre des personnes');
  if (vols && vols.taux_luynes < vols.taux_france) {
    faits.push(
      `Les vols sans violence contre des personnes sont rares à Luynes : ${formatNumber(vols.taux_luynes, 1)} pour 1 000 habitants par an, contre ${formatNumber(vols.taux_france, 1)} en France entière.`,
    );
  }
  return faits;
}
