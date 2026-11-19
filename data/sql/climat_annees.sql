-- Température moyenne de chaque année complète à Tours, et son écart à la moyenne 1971-2000
-- (base des « bandes du réchauffement » : bleu = année plus fraîche, rouge = plus chaude).
-- Résultat : src/data/generated/climat_annees.json
WITH reference AS (
  SELECT avg(temperature) AS t FROM climat_annees_completes WHERE annee BETWEEN 1971 AND 2000
)
SELECT
  annee,
  round(temperature, 2)::DOUBLE                         AS temperature,
  round(temperature - (SELECT t FROM reference), 2)::DOUBLE AS ecart,
  jours_gel::INTEGER                                    AS jours_gel,
  jours_chaleur::INTEGER                                AS jours_chaleur,
  round(pluie)::INTEGER                                 AS pluie
FROM climat_annees_completes
ORDER BY annee;
