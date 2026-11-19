-- Comment la population de Luynes vieillit (ou rajeunit) d'un recensement à l'autre.
-- Résultat : src/data/generated/population_evolution_ages.json (une ligne par recensement : 2012, 2017, 2023…).
WITH observations AS (
  SELECT unnest(observations) AS o FROM read_json('data/raw/grandes_tranches_luynes.json')
),

tranches AS (
  SELECT
    o.dimensions.TIME_PERIOD::INTEGER AS annee,
    o.dimensions.AGE                  AS tranche,     -- _T = tous âges, Y_GE65 = 65 ans et +, Y_LT20 = moins de 20 ans
    o.measures.OBS_VALUE_NIVEAU.value AS habitants
  FROM observations
  WHERE o.dimensions.SEX = '_T'                       -- hommes et femmes ensemble
)

SELECT
  annee,
  round(sum(habitants) FILTER (tranche = '_T'))::INTEGER AS population,
  round(100 * sum(habitants) FILTER (tranche = 'Y_GE65') / sum(habitants) FILTER (tranche = '_T'), 1)::DOUBLE AS part_65_plus,
  round(100 * sum(habitants) FILTER (tranche = 'Y_LT20') / sum(habitants) FILTER (tranche = '_T'), 1)::DOUBLE AS part_moins_20
FROM tranches
GROUP BY annee
ORDER BY annee;
