-- Espèces les plus souvent observées à Luynes (GBIF) : nom scientifique (sans le nom de l'auteur) et observations.
-- Résultat : src/data/generated/nature_biodiversite_top.json (10 espèces)
SELECT
  -- « Turdus merula Linnaeus, 1758 » → « Turdus merula » (les deux premiers mots)
  regexp_extract(valeur, '^(\S+ \S+)', 1) AS espece,
  observations
FROM nature_gbif_facette('data/raw/nature_gbif_top.json', 'SCIENTIFIC_NAME')
ORDER BY observations DESC
LIMIT 10;
