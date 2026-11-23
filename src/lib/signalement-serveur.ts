/**
 * Traitement d'un signalement côté serveur (appelé par functions/api/signalement.ts) : valide le corps de la requête
 * puis crée une issue dans le dépôt privé du projet via l'API REST de GitHub.
 * Le jeton (GITHUB_ISSUES_TOKEN) et le dépôt (GITHUB_REPO, « propriétaire/nom ») viennent de l'environnement Cloudflare.
 * Rien d'autre que la page et le message n'est transmis : ni adresse IP, ni e-mail, ni navigateur.
 */
import { CORPS_MAX_OCTETS, validerSignalement } from './signalement';

export interface EnvSignalement {
  GITHUB_ISSUES_TOKEN?: string;
  GITHUB_REPO?: string;
}

type Fetch = (url: string, init: RequestInit) => Promise<Response>;

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

function reponse(statut: number, corps: Record<string, unknown>): Response {
  return new Response(JSON.stringify(corps), { status: statut, headers: JSON_HEADERS });
}

/** Évite de notifier des comptes GitHub (@nom) ou de lier d'autres tickets à partir du texte d'un visiteur. */
function neutraliser(texte: string): string {
  return texte.replace(/@/g, '@​').replace(/(^|\s)#(\d)/g, '$1#​$2');
}

export async function traiterSignalement(request: Request, env: EnvSignalement, appeler: Fetch = fetch): Promise<Response> {
  if (request.method !== 'POST') return reponse(405, { ok: false, erreur: 'Méthode non autorisée.' });

  const texteBrut = await request.text();
  if (new TextEncoder().encode(texteBrut).length > CORPS_MAX_OCTETS) return reponse(413, { ok: false, erreur: 'Message trop volumineux.' });
  let corps: unknown;
  try {
    corps = JSON.parse(texteBrut);
  } catch {
    return reponse(400, { ok: false, erreur: 'Requête illisible.' });
  }

  const validation = validerSignalement(corps);
  // Robot : réponse de succès sans rien créer, pour ne pas l'aider à s'adapter.
  if (!validation.ok && validation.code === 'robot') return reponse(200, { ok: true });
  if (!validation.ok) return reponse(400, { ok: false, erreur: validation.erreur });

  const jeton = env.GITHUB_ISSUES_TOKEN;
  const depot = env.GITHUB_REPO;
  if (!jeton || !depot || !/^[\w.-]+\/[\w.-]+$/.test(depot)) {
    return reponse(503, { ok: false, indisponible: true, erreur: 'Le formulaire est momentanément indisponible.' });
  }

  const titre = `Signalement : ${validation.page || 'page non précisée'}`.slice(0, 120);
  const texte = [`**Page concernée :** ${neutraliser(validation.page) || 'non précisée'}`, '', neutraliser(validation.message)].join('\n');
  try {
    const envoi = await appeler(`https://api.github.com/repos/${depot}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jeton}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'luynes-signalement',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: titre, body: texte, labels: ['signalement'] }),
    });
    if (!envoi.ok) return reponse(502, { ok: false, indisponible: true, erreur: 'Le formulaire est momentanément indisponible.' });
    return reponse(200, { ok: true });
  } catch {
    return reponse(502, { ok: false, indisponible: true, erreur: 'Le formulaire est momentanément indisponible.' });
  }
}
