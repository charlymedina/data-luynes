-- Population de Luynes à chaque recensement, depuis 1876.
-- Résultat : src/data/generated/population_historique.json (une ligne par recensement).
SELECT
  annee::INTEGER      AS annee,
  population::INTEGER AS population
FROM read_json('data/raw/population_historique.json')
ORDER BY annee;
