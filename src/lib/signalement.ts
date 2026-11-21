/**
 * Lien « Signaler une erreur ou proposer une idée » : ouvre une issue GitHub déjà pré-remplie
 * (page concernée = adresse de la page au moment de la construction, modèle en français).
 * Un compte GitHub gratuit est nécessaire pour envoyer le signalement.
 */
import { pagePath } from './urls';

const ISSUES_NOUVELLE = 'https://github.com/charlymedina/data-luynes/issues/new';

/** Adresse de la page sur le site publié, sans « .html » ni « / » final (comme dans la barre d'adresse). */
export function adressePage(pathname: string, site: URL | undefined): string {
  return new URL(pagePath(pathname), site ?? 'https://luynes.pages.dev').toString();
}

/** Issue GitHub pré-remplie pour la page donnée (titre et texte encodés dans l'adresse). */
export function urlSignalement(pathname: string, site: URL | undefined): string {
  const page = adressePage(pathname, site);
  const titre = `Signalement ou idée : ${pagePath(pathname)}`;
  const texte = [`Page : ${page}`, '', 'Chiffre concerné : ', '', 'Ce qui ne va pas ou idée : ', ''].join('\n');
  const parametres = new URLSearchParams({ title: titre, body: texte });
  return `${ISSUES_NOUVELLE}?${parametres.toString()}`;
}
