-- Âge médian, part des moins de 20 ans et part des 65 ans et plus :
-- Luynes comparée à l'Indre-et-Loire et à la France (dernier recensement).
-- Résultat : src/data/generated/population_ages.json (une ligne par territoire).
WITH par_age AS (
  SELECT territoire, annee, age, sum(habitants) AS habitants
  FROM age_sexe
  WHERE annee = (SELECT max(annee) FROM age_sexe)
  GROUP BY ALL
),

cumul AS (
  SELECT
    *,
    sum(habitants) OVER (PARTITION BY territoire ORDER BY age) AS cumul,   -- habitants ayant cet âge ou moins
    sum(habitants) OVER (PARTITION BY territoire)              AS total
  FROM par_age
)

SELECT
  territoire,
  annee,
  -- Âge médian : la moitié des habitants est plus jeune, l'autre moitié plus âgée.
  -- On prend le premier âge où le cumul dépasse la moitié, puis on interpole à l'intérieur de cette année d'âge.
  round(arg_min(age + (total / 2 - (cumul - habitants)) / habitants, age)
        FILTER (cumul >= total / 2), 1)::DOUBLE                         AS age_median,
  round(100 * sum(habitants) FILTER (age < 20) / any_value(total), 1)::DOUBLE  AS part_moins_20,
  round(100 * sum(habitants) FILTER (age >= 65) / any_value(total), 1)::DOUBLE AS part_65_plus
FROM cumul
GROUP BY territoire, annee
ORDER BY CASE territoire WHEN 'Luynes' THEN 1 WHEN 'Indre-et-Loire' THEN 2 ELSE 3 END;
