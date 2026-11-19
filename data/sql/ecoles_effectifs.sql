-- Élèves des écoles de Luynes à chaque rentrée, et nombre moyen d'élèves par classe comparé au département.
-- Résultat : src/data/generated/ecoles_effectifs.json
WITH luynes AS (
  SELECT rentree, sum(eleves) AS eleves, sum(classes) AS classes FROM effectifs_ecoles GROUP BY rentree
),
dep AS (
  SELECT left(rentree_scolaire, 4)::INTEGER AS rentree, eleves, classes
  FROM read_json('data/raw/effectifs_ecoles_37.json')
)
SELECT
  l.rentree,
  l.eleves::INTEGER                             AS eleves,
  l.classes::INTEGER                            AS classes,
  round(l.eleves / l.classes, 1)::DOUBLE        AS eleves_par_classe,
  d.eleves::INTEGER                             AS eleves_37,
  round(d.eleves / d.classes, 1)::DOUBLE        AS eleves_par_classe_37
FROM luynes l
LEFT JOIN dep d USING (rentree)
ORDER BY l.rentree;
