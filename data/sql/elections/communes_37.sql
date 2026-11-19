-- Extrait archivé : inscrits et votants de chaque commune d'Indre-et-Loire, à chaque scrutin.
-- Sert à classer la participation de Luynes parmi les communes du département.
-- Exécuté par scripts/archive-elections.ts → data/archive/elections/communes_37.parquet
SELECT
  id_election,
  code_commune,
  sum(inscrits) AS inscrits,
  sum(votants)  AS votants
FROM read_parquet('{general}')
WHERE code_departement = '37'
GROUP BY id_election, code_commune
ORDER BY id_election, code_commune;
