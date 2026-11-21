-- Restauration scolaire de Luynes : moyenne bio / durable des cuisines qui servent les écoles (dernière année déclarée).
-- Chaque cuisine centrale compte pour une, même si elle approvisionne plusieurs écoles.
-- Résultat : src/data/generated/equipements_cantines_ecoles.json (une ligne)
WITH cuisines AS (
  SELECT cuisine_centrale, any_value(annee) AS annee, any_value(bio_pct) AS bio_pct, any_value(durable_pct) AS durable_pct
  FROM cantines
  WHERE ecole AND annee = (SELECT max(annee) FROM cantines WHERE ecole)
  GROUP BY cuisine_centrale
)
SELECT
  any_value(annee)::INTEGER             AS annee,
  count(*)::INTEGER                     AS cuisines,
  round(avg(bio_pct), 1)::DOUBLE        AS bio_pct,
  round(avg(durable_pct), 1)::DOUBLE    AS durable_pct,
  (SELECT count(*) FROM cantines WHERE ecole AND annee = (SELECT max(annee) FROM cantines WHERE ecole))::INTEGER AS cantines_ecoles
FROM cuisines;
