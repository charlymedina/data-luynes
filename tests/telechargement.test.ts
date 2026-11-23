/** Tests unitaires du téléchargement incrémental et de l'alerte de variation (npm run test:unit). */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  compterLignesJson,
  decider,
  evaluerVariation,
  joursEntre,
  signatureDepuisEntetes,
  type ContexteDecision,
  type EntreeManifeste,
} from '../scripts/telechargement.ts';

const entree: EntreeManifeste = { definition: 'd', signature: 's1', telechargeLe: '2026-11-16', verifieLe: '2026-11-16', lignes: 100, octets: 5000 };
const base = (surcharge: Partial<ContexteDecision>): ContexteDecision => ({
  entree,
  definition: 'd',
  fichierLocalPresent: true,
  force: false,
  validiteJours: 7,
  aujourdhui: '2026-11-18',
  signatureActuelle: async () => 's1',
  ...surcharge,
});

test('joursEntre compte des jours entiers', () => {
  assert.equal(joursEntre('2026-11-16', '2026-11-23'), 7);
  assert.equal(joursEntre('2026-12-31', '2027-01-01'), 1);
});

test('decider : --force, pas de version locale ou définition modifiée → téléchargement', async () => {
  assert.equal((await decider(base({ force: true }))).action, 'telecharger');
  assert.equal((await decider(base({ entree: undefined }))).action, 'telecharger');
  assert.equal((await decider(base({ fichierLocalPresent: false }))).action, 'telecharger');
  assert.equal((await decider(base({ definition: 'autre' }))).action, 'telecharger');
});

test('decider : signature identique → réutilisée, signature différente → téléchargée', async () => {
  const identique = await decider(base({}));
  assert.equal(identique.action, 'reutiliser');
  assert.equal((await decider(base({ signatureActuelle: async () => 's2' }))).action, 'telecharger');
});

test('decider : signature inchangée mais trop ancienne → téléchargée (garde-fou)', async () => {
  assert.equal((await decider(base({ aujourdhui: '2026-12-20' }))).action, 'telecharger');
});

test('decider : serveur muet sur HEAD → durée de validité', async () => {
  const muet = { signatureActuelle: async () => undefined };
  assert.equal((await decider(base({ ...muet, aujourdhui: '2026-11-20' }))).action, 'reutiliser');
  assert.equal((await decider(base({ ...muet, aujourdhui: '2026-11-23' }))).action, 'telecharger');
});

test('decider : source sans signature → durée de validité (réglable)', async () => {
  const sansSignature = { entree: { ...entree, signature: undefined } };
  assert.equal((await decider(base({ ...sansSignature, aujourdhui: '2026-11-20' }))).action, 'reutiliser');
  assert.equal((await decider(base({ ...sansSignature, aujourdhui: '2026-11-23' }))).action, 'telecharger');
  assert.equal((await decider(base({ ...sansSignature, aujourdhui: '2026-11-17', validiteJours: 0 }))).action, 'telecharger');
});

test('signatureDepuisEntetes : undefined sans validateur, stable quel que soit l\'ordre', () => {
  const a = { url: 'https://a', etag: '"1"', lastModified: null };
  const b = { url: 'https://b', etag: null, lastModified: 'lundi' };
  assert.equal(signatureDepuisEntetes([a, { url: 'https://c', etag: null, lastModified: null }]), undefined);
  assert.equal(signatureDepuisEntetes([]), undefined);
  assert.equal(signatureDepuisEntetes([a, b]), signatureDepuisEntetes([b, a]));
  assert.notEqual(signatureDepuisEntetes([a]), signatureDepuisEntetes([{ ...a, etag: '"2"' }]));
});

test('compterLignesJson : tableau, data, features, sinon inconnu', () => {
  assert.equal(compterLignesJson([1, 2]), 2);
  assert.equal(compterLignesJson({ data: [1, 2, 3] }), 3);
  assert.equal(compterLignesJson({ features: [1] }), 1);
  assert.equal(compterLignesJson({ nom: 'Luynes' }), undefined);
});

test('evaluerVariation : seuil, écart minimal et seuil propre à la source', () => {
  const source = { id: 'x', description: 'Source X' };
  assert.equal(evaluerVariation(source, { lignes: 1000, octets: 1 }, { lignes: 1090, octets: 1 }), null);
  const hausse = evaluerVariation(source, { lignes: 1000, octets: 1 }, { lignes: 1150, octets: 1 });
  assert.equal(hausse?.variationPct, 15);
  assert.equal(hausse?.mesure, 'lignes');
  const baisse = evaluerVariation(source, { lignes: 1000, octets: 1 }, { lignes: 400, octets: 1 });
  assert.equal(baisse?.variationPct, -60);
  assert.equal(evaluerVariation(source, { lignes: 3, octets: 1 }, { lignes: 4, octets: 1 }), null, 'écart de 1 ligne ignoré');
  assert.equal(evaluerVariation({ ...source, seuilAlertePct: 50 }, { lignes: 1000, octets: 1 }, { lignes: 1150, octets: 1 }), null);
  assert.equal(evaluerVariation(source, undefined, { lignes: 10, octets: 1 }), null, 'première fois : rien à comparer');
});

test('evaluerVariation : une source qui se vide est signalée ; sans lignes, comparaison en octets', () => {
  const source = { id: 'x', description: 'Source X' };
  assert.equal(evaluerVariation(source, { lignes: 100, octets: 1 }, { lignes: 0, octets: 1 })?.variationPct, -100);
  const octets = evaluerVariation(source, { octets: 100_000 }, { octets: 50_000 });
  assert.equal(octets?.mesure, 'octets');
  assert.equal(evaluerVariation(source, { octets: 100_000 }, { octets: 101_000 }), null);
});
