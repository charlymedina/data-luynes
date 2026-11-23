/** Formulaire /signaler : pré-remplit la page d'origine, compte les caractères et envoie le signalement à /api/signalement. */
import { MESSAGE_MAX, MESSAGE_MIN, nettoyerPage } from './signalement';

const MESSAGES = {
  court: `Le message doit faire au moins ${MESSAGE_MIN} caractères.`,
  envoi: 'Envoi en cours…',
  merci: 'Merci ! Le signalement a bien été transmis.',
  indisponible: 'Le formulaire est momentanément indisponible. Merci de réessayer plus tard.',
} as const;

export function initFormulaireSignalement(): void {
  const form = document.querySelector<HTMLFormElement>('#form-signalement');
  if (!form) return;
  const page = form.querySelector<HTMLInputElement>('[name=page]');
  const message = form.querySelector<HTMLTextAreaElement>('[name=message]');
  const piege = form.querySelector<HTMLInputElement>('[name=piege]');
  const compteur = form.querySelector<HTMLElement>('#compteur');
  const bouton = form.querySelector<HTMLButtonElement>('button[type=submit]');
  const etat = document.querySelector<HTMLElement>('#etat-signalement');
  if (!page || !message || !piege || !compteur || !bouton || !etat) return;

  const ouvertLe = Date.now();
  page.value = nettoyerPage(new URLSearchParams(location.search).get('page'));
  const majCompteur = (): void => {
    compteur.textContent = `${message.value.length} / ${MESSAGE_MAX}`;
  };
  message.addEventListener('input', majCompteur);
  majCompteur();

  const afficher = (texte: string, erreur: boolean): void => {
    etat.textContent = texte;
    etat.dataset.erreur = erreur ? 'oui' : 'non';
    etat.hidden = false;
  };

  form.addEventListener('submit', async (evenement) => {
    evenement.preventDefault();
    if (message.value.trim().length < MESSAGE_MIN) {
      afficher(MESSAGES.court, true);
      message.focus();
      return;
    }
    bouton.disabled = true;
    afficher(MESSAGES.envoi, false);
    try {
      const reponse = await fetch('/api/signalement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: page.value, message: message.value, piege: piege.value, duree: Date.now() - ouvertLe }),
      });
      const donnees = (await reponse.json()) as { ok?: boolean; erreur?: string };
      if (donnees.ok) {
        afficher(MESSAGES.merci, false);
        message.value = '';
        majCompteur();
        return;
      }
      afficher(reponse.status === 400 && donnees.erreur ? donnees.erreur : MESSAGES.indisponible, true);
    } catch {
      afficher(MESSAGES.indisponible, true);
    } finally {
      bouton.disabled = false;
    }
  });
}
