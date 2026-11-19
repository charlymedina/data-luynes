-- Nombre d'accidents corporels à Luynes chaque année (y compris les années sans accident).
-- Résultat : src/data/generated/accidents_annees.json
WITH annees AS (
  SELECT annee FROM range((SELECT min(annee) FROM accidents), (SELECT max(annee) FROM accidents) + 1) AS t(annee)
)
SELECT
  y.annee::INTEGER                                                   AS annee,
  count(a.num_acc)::INTEGER                                          AS accidents,
  count(a.num_acc) FILTER (a.gravite IN ('mortel', 'grave'))::INTEGER AS accidents_graves
FROM annees y
LEFT JOIN accidents_complet a ON a.annee = y.annee AND a.est_luynes
GROUP BY y.annee
ORDER BY y.annee;
