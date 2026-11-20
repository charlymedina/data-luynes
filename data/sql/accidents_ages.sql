-- Âge des personnes impliquées dans les accidents corporels (conducteurs, passagers, piétons, blessés ou indemnes),
-- à Luynes et en Indre-et-Loire, sur toute la période. Âge = année de l'accident − année de naissance.
-- Résultat : src/data/generated/accidents_ages.json (une ligne par tranche d'âge)
WITH personnes AS (
  SELECT
    a.est_luynes,
    CASE
      WHEN u.age < 18 THEN 1 WHEN u.age < 25 THEN 2 WHEN u.age < 35 THEN 3
      WHEN u.age < 45 THEN 4 WHEN u.age < 65 THEN 5 ELSE 6
    END AS ordre
  FROM accidents_usagers_detail u
  JOIN accidents a USING (num_acc)
  WHERE u.age IS NOT NULL
),

tranches AS (
  SELECT * FROM (VALUES (1, 'Moins de 18 ans'), (2, '18-24 ans'), (3, '25-34 ans'), (4, '35-44 ans'), (5, '45-64 ans'), (6, '65 ans et plus'))
    AS t(ordre, tranche)
)

SELECT
  t.ordre,
  t.tranche,
  count(*) FILTER (p.est_luynes)::INTEGER                                                  AS personnes_luynes,
  round(100 * count(*) FILTER (p.est_luynes) / (SELECT count(*) FROM personnes WHERE est_luynes), 1)::DOUBLE AS part_luynes,
  round(100 * count(p.ordre) / (SELECT count(*) FROM personnes), 1)::DOUBLE                 AS part_37
FROM tranches t
LEFT JOIN personnes p USING (ordre)
GROUP BY t.ordre, t.tranche
ORDER BY t.ordre;
