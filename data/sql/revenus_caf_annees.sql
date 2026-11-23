-- Évolution du nombre de foyers allocataires de la CAF (au moins une prestation légale) : Luynes et Indre-et-Loire,
-- chaque mois de décembre depuis le premier publié par la CAF au niveau des communes.
-- L'évolution est rapportée à la première année : « +3 % » ou « −4 % » depuis cette année-là.
-- Résultat : src/data/generated/revenus_caf_annees.json (une ligne par année).
WITH serie AS (
  SELECT
    annee,
    max(foyers) FILTER (territoire = 'Luynes')         AS foyers,
    max(foyers) FILTER (territoire = 'Indre-et-Loire') AS foyers_37
  FROM caf_foyers
  WHERE prestation = 'ndur' AND dtreffre LIKE '%-12'
  GROUP BY annee
)
SELECT
  annee::INTEGER                                                                     AS annee,
  foyers::INTEGER                                                                    AS foyers,
  foyers_37::INTEGER                                                                 AS foyers_37,
  round(100 * (foyers / first(foyers) OVER (ORDER BY annee) - 1), 1)::DOUBLE         AS evolution_pct,
  round(100 * (foyers_37 / first(foyers_37) OVER (ORDER BY annee) - 1), 1)::DOUBLE   AS evolution_37_pct
FROM serie
WHERE foyers IS NOT NULL
ORDER BY annee;
