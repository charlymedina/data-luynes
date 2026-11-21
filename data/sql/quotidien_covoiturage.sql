-- Covoiturage « intermédié » (par une plateforme de mise en relation) : trajets dont Luynes est la commune de départ, par an,
-- comparés à l'Indre-et-Loire (trajets pour 1 000 habitants).
-- Le fichier contient toutes les communes (0 trajet si aucun trajet enregistré).
-- Résultat : src/data/generated/quotidien_covoiturage.json (une ligne par année)
WITH pop AS (
  SELECT (SELECT population FROM communes_37 WHERE code = '37139') AS luynes, sum(population) AS departement FROM communes_37
)
SELECT
  annee,
  coalesce(sum(trajets) FILTER (code = '37139'), 0)::INTEGER                                         AS trajets,
  round(1000 * coalesce(sum(trajets) FILTER (code = '37139'), 0) / (SELECT luynes FROM pop), 1)::DOUBLE AS pour_1000,
  sum(trajets)::INTEGER                                                                              AS trajets_37,
  round(1000 * sum(trajets) / (SELECT departement FROM pop), 1)::DOUBLE                              AS pour_1000_37,
  count(*)::INTEGER                                                                                  AS communes_37_avec_trajets
FROM quotidien_covoiturage
GROUP BY annee
ORDER BY annee;
