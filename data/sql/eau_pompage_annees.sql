-- Eau puisée sous Luynes, année par année : volume prélevé (en m³) par usage.
-- « potable » = forage(s) d'eau potable, « irrigation » = arrosage agricole, « autre » = industrie ou autres usages.
-- Résultat : src/data/generated/eau_pompage_annees.json
SELECT
  annee,
  round(sum(volume_m3) FILTER (usage = 'potable'))::DOUBLE    AS potable_m3,
  round(sum(volume_m3) FILTER (usage = 'irrigation'))::DOUBLE AS irrigation_m3,
  round(sum(volume_m3) FILTER (usage = 'autre'))::DOUBLE      AS autre_m3
FROM eau_pompage
GROUP BY annee
ORDER BY annee;
