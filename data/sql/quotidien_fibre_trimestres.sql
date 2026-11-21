-- Part des locaux raccordables à la fibre à chaque date publiée : Luynes et Indre-et-Loire.
-- Les premières dates sont annuelles (même trimestre chaque année), les dernières trimestrielles.
-- Résultat : src/data/generated/quotidien_fibre_trimestres.json (une ligne par date)
SELECT
  strftime(date_fin, '%Y-%m-%d')                                                              AS date_fin,
  year(date_fin)::INTEGER                                                                     AS annee,
  ((month(date_fin) - 1) // 3 + 1)::INTEGER                                                   AS trimestre,
  sum(locaux) FILTER (code = '37139')::INTEGER                                                AS locaux,
  sum(fibre) FILTER (code = '37139')::INTEGER                                                 AS fibre,
  round(100 * sum(fibre) FILTER (code = '37139') / sum(locaux) FILTER (code = '37139'), 1)::DOUBLE AS luynes_pct,
  round(100 * sum(fibre) / sum(locaux), 1)::DOUBLE                                            AS departement_pct
FROM quotidien_fibre
GROUP BY date_fin
ORDER BY date_fin;
