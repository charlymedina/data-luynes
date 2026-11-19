-- Voitures particulières immatriculées à Luynes au 1er janvier de chaque année, par motorisation.
-- Résultat : src/data/generated/mobilite_parc_annees.json (une ligne par année).
SELECT
  annee,
  sum(vehicules)::INTEGER                                                     AS voitures,
  sum(vehicules) FILTER (motorisation = 'Essence')::INTEGER                   AS essence,
  sum(vehicules) FILTER (motorisation = 'Diesel')::INTEGER                    AS diesel,
  sum(vehicules) FILTER (motorisation = 'Hybride')::INTEGER                   AS hybride,
  sum(vehicules) FILTER (motorisation = 'Hybride rechargeable')::INTEGER      AS hybride_rechargeable,
  sum(vehicules) FILTER (motorisation = 'Électrique')::INTEGER                AS electrique,
  sum(vehicules) FILTER (motorisation = 'Gaz et autres')::INTEGER             AS autres,
  round(100 * sum(vehicules) FILTER (motorisation = 'Électrique') / sum(vehicules), 1)::DOUBLE AS part_electrique_pct,
  round(100 * sum(vehicules) FILTER (motorisation = 'Diesel') / sum(vehicules), 1)::DOUBLE     AS part_diesel_pct
FROM parc_luynes
WHERE groupe = 'VP'
GROUP BY annee
ORDER BY annee;
