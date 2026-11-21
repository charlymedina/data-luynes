-- Fibre à Luynes : part des locaux raccordables à la fibre au dernier trimestre publié, comparée à l'Indre-et-Loire,
-- rang parmi les communes du département et évolution depuis le même trimestre quatre ans plus tôt et depuis le trimestre précédent.
-- Rang 1 = la plus forte part de locaux raccordables.
-- Résultat : src/data/generated/quotidien_fibre_resume.json (une ligne)
WITH dates AS (
  SELECT max(date_fin) AS fin, min(date_fin) AS debut FROM quotidien_fibre
),
precedent AS (
  SELECT max(date_fin) AS date_fin FROM quotidien_fibre, dates WHERE date_fin < fin
),
-- Part de chaque commune au dernier trimestre
classement AS (
  SELECT
    code, locaux, fibre,
    100 * fibre / locaux                                   AS part,
    rank() OVER (ORDER BY fibre / locaux DESC)             AS rang,
    count(*) OVER ()                                       AS nb_communes,
    fibre = locaux                                         AS toutes_fibrees
  FROM quotidien_fibre, dates WHERE date_fin = fin
),
-- Part de Luynes et du département à une date donnée
part_a AS (
  SELECT date_fin,
    100 * sum(fibre) FILTER (code = '37139') / sum(locaux) FILTER (code = '37139') AS luynes,
    100 * sum(fibre) / sum(locaux)                                                 AS departement
  FROM quotidien_fibre GROUP BY date_fin
)
SELECT
  strftime(d.fin, '%Y-%m-%d')                       AS date_fin,
  strftime(d.debut, '%Y-%m-%d')                     AS date_debut,
  c.locaux::INTEGER                                 AS locaux,
  c.fibre::INTEGER                                  AS fibre,
  (c.locaux - c.fibre)::INTEGER                     AS sans_fibre,
  round(c.part, 1)::DOUBLE                          AS fibre_pct,
  round((SELECT departement FROM part_a WHERE date_fin = d.fin), 1)::DOUBLE   AS fibre_pct_37,
  c.rang::INTEGER                                   AS rang,
  c.nb_communes::INTEGER                            AS nb_communes,
  (SELECT count(*) FROM classement WHERE toutes_fibrees)::INTEGER AS communes_100_pct,
  round((SELECT luynes FROM part_a WHERE date_fin = d.debut), 1)::DOUBLE      AS fibre_pct_debut,
  round((SELECT departement FROM part_a WHERE date_fin = d.debut), 1)::DOUBLE AS fibre_pct_37_debut,
  round(c.part - (SELECT luynes FROM part_a WHERE date_fin = (SELECT date_fin FROM precedent)), 1)::DOUBLE AS gain_dernier_trimestre_points
FROM dates d, classement c
WHERE c.code = '37139';
