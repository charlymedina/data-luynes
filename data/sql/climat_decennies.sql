-- Le climat de Tours décennie par décennie : jours de gel et de forte chaleur par an, température moyenne.
-- Seules les années complètes comptent ; une décennie en cours est indiquée avec son nombre d'années.
-- Résultat : src/data/generated/climat_decennies.json
SELECT
  (annee // 10 * 10)::INTEGER                 AS decennie,
  count(*)::INTEGER                           AS nb_annees,
  round(avg(temperature), 1)::DOUBLE          AS temperature,
  round(avg(jours_gel), 1)::DOUBLE            AS jours_gel,
  round(avg(jours_chaleur), 1)::DOUBLE        AS jours_chaleur,
  round(avg(pluie))::INTEGER                  AS pluie
FROM climat_annees_completes
GROUP BY ALL
ORDER BY decennie;
