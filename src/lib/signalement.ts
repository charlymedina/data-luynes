/**
 * Signalement d'une erreur ou d'une idée : lien vers le formulaire du site (/signaler) et règles de validation,
 * partagées par le formulaire (navigateur) et par la Pages Function qui le reçoit (functions/api/signalement.ts).
 * Aucune adresse e-mail n'est demandée : on ne peut pas répondre aux signalements, ils servent à corriger le site.
 */
import { pagePath } from './urls';

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;
export const PAGE_MAX = 200;
/** Délai minimal (ms) entre l'affichage du formulaire et son envoi : un robot remplit tout en quelques millisecondes. */
export const DELAI_MIN_MS = 3000;
/** Taille maximale du corps de la requête (octets) : largement assez pour 2000 caractères. */
export const CORPS_MAX_OCTETS = 10_000;

/** Contenu envoyé par le formulaire. `piege` est le champ caché (doit rester vide), `duree` le temps passé sur la page. */
export interface Signalement {
  page: string;
  message: string;
  piege: string;
  duree: number;
}

export type ResultatValidation =
  | { ok: true; page: string; message: string }
  | { ok: false; code: 'invalide' | 'robot'; erreur: string };

/** Lien vers le formulaire, avec la page d'origine pré-remplie (« /budget.html » → « /signaler?page=%2Fbudget »). */
export function lienSignalement(pathname: string): string {
  return `/signaler?${new URLSearchParams({ page: pagePath(pathname) }).toString()}`;
}

/** Page concernée : une seule ligne, 200 caractères au plus. */
export function nettoyerPage(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur.replace(/\s+/g, ' ').trim().slice(0, PAGE_MAX) : '';
}

/** Valide un corps JSON déjà décodé. Un robot (champ caché rempli, envoi trop rapide) est repéré par `code: 'robot'`. */
export function validerSignalement(corps: unknown): ResultatValidation {
  if (typeof corps !== 'object' || corps === null) return { ok: false, code: 'invalide', erreur: 'Requête illisible.' };
  const { page, message, piege, duree } = corps as Partial<Record<keyof Signalement, unknown>>;
  if (typeof piege === 'string' && piege !== '') return { ok: false, code: 'robot', erreur: 'Envoi refusé.' };
  if (typeof duree !== 'number' || !Number.isFinite(duree) || duree < DELAI_MIN_MS) {
    return { ok: false, code: 'robot', erreur: 'Envoi trop rapide : merci de réessayer.' };
  }
  if (typeof message !== 'string') return { ok: false, code: 'invalide', erreur: 'Le message est obligatoire.' };
  const texte = message.trim();
  if (texte.length < MESSAGE_MIN) return { ok: false, code: 'invalide', erreur: `Le message doit faire au moins ${MESSAGE_MIN} caractères.` };
  if (texte.length > MESSAGE_MAX) return { ok: false, code: 'invalide', erreur: `Le message doit faire au plus ${MESSAGE_MAX} caractères.` };
  return { ok: true, page: nettoyerPage(page), message: texte };
}
