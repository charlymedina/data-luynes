import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DELAI_MIN_MS, MESSAGE_MAX, lienSignalement, validerSignalement } from '../src/lib/signalement.ts';
import { traiterSignalement } from '../src/lib/signalement-serveur.ts';

const ENV = { GITHUB_ISSUES_TOKEN: 'jeton-de-test', GITHUB_REPO: 'proprio/depot' };
const VALIDE = { page: '/budget', message: 'Le chiffre des dépenses semble faux.', piege: '', duree: DELAI_MIN_MS + 1000 };

const requete = (corps: unknown, methode = 'POST'): Request =>
  new Request('https://luynes.pages.dev/api/signalement', { method: methode, body: methode === 'POST' ? JSON.stringify(corps) : undefined });

test('lienSignalement : renvoie vers le formulaire avec la page d’origine', () => {
  assert.equal(lienSignalement('/budget.html'), '/signaler?page=%2Fbudget');
  assert.equal(lienSignalement('/'), '/signaler?page=%2F');
});

test('validerSignalement : accepte un message correct et nettoie la page', () => {
  const r = validerSignalement({ ...VALIDE, page: '  /budget \n ' });
  assert.deepEqual(r, { ok: true, page: '/budget', message: VALIDE.message });
});

test('validerSignalement : refuse message trop court, trop long ou absent', () => {
  assert.equal(validerSignalement({ ...VALIDE, message: 'court' }).ok, false);
  assert.equal(validerSignalement({ ...VALIDE, message: 'x'.repeat(MESSAGE_MAX + 1) }).ok, false);
  assert.equal(validerSignalement({ ...VALIDE, message: undefined }).ok, false);
  assert.equal(validerSignalement(null).ok, false);
});

test('validerSignalement : repère les robots (champ piège rempli, envoi trop rapide)', () => {
  assert.deepEqual(validerSignalement({ ...VALIDE, piege: 'http://spam' }), { ok: false, code: 'robot', erreur: 'Envoi refusé.' });
  const rapide = validerSignalement({ ...VALIDE, duree: 200 });
  assert.equal(rapide.ok === false && rapide.code, 'robot');
});

test('traiterSignalement : crée une issue avec le label et ne transmet que page et message', async () => {
  let appel: { url: string; init: RequestInit } | undefined;
  const faux = async (url: string, init: RequestInit): Promise<Response> => {
    appel = { url, init };
    return new Response('{}', { status: 201 });
  };
  const r = await traiterSignalement(requete({ ...VALIDE, message: 'Merci @quelquun de vérifier ce chiffre.' }), ENV, faux);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true });
  assert.equal(appel?.url, 'https://api.github.com/repos/proprio/depot/issues');
  const envoye = JSON.parse(String(appel?.init.body)) as { title: string; body: string; labels: string[] };
  assert.deepEqual(envoye.labels, ['signalement']);
  assert.match(envoye.title, /\/budget/);
  assert.doesNotMatch(envoye.body, /@quelquun/, 'les mentions @ sont neutralisées');
  assert.match(String((appel?.init.headers as Record<string, string>).Authorization), /^Bearer jeton-de-test$/);
});

test('traiterSignalement : 400 si le message est invalide, sans appeler GitHub', async () => {
  const faux = async (): Promise<Response> => assert.fail('GitHub ne doit pas être appelé');
  const r = await traiterSignalement(requete({ ...VALIDE, message: 'court' }), ENV, faux);
  assert.equal(r.status, 400);
  assert.equal(((await r.json()) as { ok: boolean }).ok, false);
});

test('traiterSignalement : un robot reçoit un succès sans qu’aucune issue soit créée', async () => {
  const faux = async (): Promise<Response> => assert.fail('GitHub ne doit pas être appelé');
  const r = await traiterSignalement(requete({ ...VALIDE, piege: 'x' }), ENV, faux);
  assert.equal(r.status, 200);
});

test('traiterSignalement : 503 propre si le jeton n’est pas configuré', async () => {
  const r = await traiterSignalement(requete(VALIDE), {}, async () => assert.fail('pas d’appel'));
  assert.equal(r.status, 503);
  assert.equal(((await r.json()) as { indisponible: boolean }).indisponible, true);
});

test('traiterSignalement : 502 si GitHub refuse ou ne répond pas', async () => {
  assert.equal((await traiterSignalement(requete(VALIDE), ENV, async () => new Response('{}', { status: 403 }))).status, 502);
  assert.equal((await traiterSignalement(requete(VALIDE), ENV, async () => { throw new Error('réseau'); })).status, 502);
});

test('traiterSignalement : refuse GET, JSON illisible et corps trop gros', async () => {
  assert.equal((await traiterSignalement(requete(null, 'GET'), ENV)).status, 405);
  const illisible = new Request('https://x/api/signalement', { method: 'POST', body: '{pas du json' });
  assert.equal((await traiterSignalement(illisible, ENV)).status, 400);
  assert.equal((await traiterSignalement(requete({ ...VALIDE, message: 'x'.repeat(20_000) }), ENV)).status, 413);
});
