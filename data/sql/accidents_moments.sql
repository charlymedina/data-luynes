-- Quand ont lieu les accidents ? Répartition par moment de la journée et par type de jour,
-- à Luynes et en Indre-et-Loire (en % des accidents).
-- Résultat : src/data/generated/accidents_moments.json
WITH reperes AS (
  SELECT
    est_luynes,
    moment,
    CASE WHEN jour_semaine >= 6 THEN 'Week-end' ELSE 'Semaine' END AS type_jour
  FROM accidents_complet
),
totaux AS (
  SELECT count(*) FILTER (est_luynes) AS luynes, count(*) AS tous FROM reperes
),
lignes AS (
  SELECT 'moment' AS dimension, moment AS libelle, est_luynes FROM reperes
  UNION ALL
  SELECT 'jour', type_jour, est_luynes FROM reperes
)
SELECT
  dimension,
  libelle,
  count(*) FILTER (est_luynes)::INTEGER                                         AS accidents_luynes,
  round(100.0 * count(*) FILTER (est_luynes) / (SELECT luynes FROM totaux), 1)::DOUBLE AS part_luynes,
  round(100.0 * count(*) / (SELECT tous FROM totaux), 1)::DOUBLE                AS part_37
FROM lignes
GROUP BY dimension, libelle
ORDER BY dimension DESC,
  CASE libelle WHEN 'Matin' THEN 1 WHEN 'Après-midi' THEN 2 WHEN 'Soirée' THEN 3 WHEN 'Nuit' THEN 4
               WHEN 'Semaine' THEN 5 ELSE 6 END;
