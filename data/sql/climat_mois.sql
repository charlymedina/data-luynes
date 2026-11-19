-- Normales mensuelles à Tours sur 1991-2020 (la période de référence officielle des « normales ») :
-- pluie moyenne du mois, températures minimale et maximale moyennes.
-- Résultat : src/data/generated/climat_mois.json (12 lignes)
WITH par_mois AS (
  SELECT annee, mois, sum(rr) AS pluie, avg(tn) AS tn, avg(tx) AS tx
  FROM meteo_tours
  WHERE annee BETWEEN 1991 AND 2020 AND annee IN (SELECT annee FROM climat_annees_completes)
  GROUP BY annee, mois
)
SELECT
  mois,
  round(avg(pluie))::INTEGER   AS pluie,
  round(avg(tn), 1)::DOUBLE    AS temperature_min,
  round(avg(tx), 1)::DOUBLE    AS temperature_max
FROM par_mois
GROUP BY mois
ORDER BY mois;
