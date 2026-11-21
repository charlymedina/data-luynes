import assert from 'node:assert/strict';
import { test } from 'node:test';
import { adressePage, urlSignalement } from '../src/lib/signalement.ts';

const SITE = new URL('https://luynes.pages.dev');

test('adressePage : retire .html et le slash final', () => {
  assert.equal(adressePage('/budget.html', SITE), 'https://luynes.pages.dev/budget');
  assert.equal(adressePage('/', SITE), 'https://luynes.pages.dev/');
});

test('urlSignalement : ouvre une issue GitHub avec la page, le titre et le modèle encodés', () => {
  const url = new URL(urlSignalement('/transparence.html', SITE));
  assert.equal(url.origin + url.pathname, 'https://github.com/charlymedina/data-luynes/issues/new');
  assert.match(url.searchParams.get('title') ?? '', /\/transparence$/);
  const corps = url.searchParams.get('body') ?? '';
  assert.match(corps, /^Page : https:\/\/luynes\.pages\.dev\/transparence/);
  assert.match(corps, /Chiffre concerné/);
  assert.match(corps, /Ce qui ne va pas ou idée/);
});

test('urlSignalement : valeur par défaut quand le site n’est pas configuré', () => {
  assert.match(urlSignalement('/eau', undefined), /luynes\.pages\.dev%2Feau/);
});
