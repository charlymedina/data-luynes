-- Nombre de licences par année, à Luynes et en Indre-et-Loire, et indice (première année = 100) pour comparer l'évolution.
-- Résultat : src/data/generated/sport_annees.json (une ligne par année)
WITH par_annee AS (
  SELECT annee,
         sum(total) FILTER (code = '37139') AS luynes,
         sum(total)                          AS departement
  FROM sport_licences
  GROUP BY annee
)
SELECT
  annee::INTEGER AS annee,
  luynes::INTEGER AS licences,
  departement::INTEGER AS licences_37,
  round(100 * luynes / first_value(luynes) OVER (ORDER BY annee), 1)::DOUBLE AS indice_luynes,
  round(100 * departement / first_value(departement) OVER (ORDER BY annee), 1)::DOUBLE AS indice_37
FROM par_annee
ORDER BY annee;
