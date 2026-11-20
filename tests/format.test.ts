/** Tests unitaires des fonctions d'affichage des nombres (npm run test:unit). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCommunes, formatNumber, formatOneDecimal, formatOneIn, formatPercent, formatRank, formatRankOf, formatRatio } from '../src/lib/format.ts';
import { pagePath, themeHref } from '../src/lib/urls.ts';

test('formatNumber : espace insécable normale pour les milliers et virgule décimale', () => {
  assert.equal(formatNumber(5062), '5 062');
  assert.equal(formatNumber(34.12, 1), '34,1');
  assert.equal(formatNumber(1.0, 1), '1');
});

test('formatOneDecimal : toujours une décimale pour comparer des taux', () => {
  assert.equal(formatOneDecimal(1), '1,0');
  assert.equal(formatOneDecimal(0.33), '0,3');
});

test('formatRank et formatRankOf : rang toujours accompagné de son ensemble', () => {
  assert.equal(formatRank(1), '1ʳᵉ');
  assert.equal(formatRank(19), '19ᵉ');
  assert.equal(formatRankOf(19, 272), "19ᵉ sur 272 communes d'Indre-et-Loire");
  assert.equal(formatCommunes(198, 'communes comparables'), '198 communes comparables');
});

test('formatPercent, formatRatio et formatOneIn', () => {
  assert.equal(formatPercent(26.49), '26,5 %');
  assert.equal(formatRatio(148, 101), '1,5');
  assert.equal(formatOneIn(26.5, 'habitant'), "plus d'un habitant sur 4");
  assert.equal(formatOneIn(25, 'habitant'), "un habitant sur 4");
});

test('adresses internes sans « / » final (pages construites en .html)', () => {
  assert.equal(pagePath('/population.html'), '/population');
  assert.equal(pagePath('/population/'), '/population');
  assert.equal(pagePath('/index.html'), '/');
  assert.equal(pagePath('/'), '/');
  assert.equal(themeHref('population', 'ages'), '/population#ages');
});
