-- Sur quelles routes de Luynes se produisent les accidents ? Routes départementales / métropolitaines nommées,
-- le reste (rues, voies communales, parkings…) regroupé.
-- Résultat : src/data/generated/accidents_routes.json
SELECT
  coalesce(route, 'Rues et voies communales') AS route,
  route IS NULL                               AS est_autres,
  count(*)::INTEGER                           AS accidents,
  count(*) FILTER (gravite IN ('mortel', 'grave'))::INTEGER AS accidents_graves
FROM accidents_complet
WHERE est_luynes
GROUP BY ALL
ORDER BY est_autres, accidents DESC, route;
