/**
 * Cloudflare Pages Function : POST /api/signalement (JSON). Déployée avec le site par « wrangler pages deploy dist »
 * car le dossier functions/ est à la racine du projet. La logique est dans src/lib/signalement-serveur.ts (testée).
 */
import { traiterSignalement, type EnvSignalement } from '../../src/lib/signalement-serveur';

export const onRequest = ({ request, env }: { request: Request; env: EnvSignalement }): Promise<Response> =>
  traiterSignalement(request, env);
