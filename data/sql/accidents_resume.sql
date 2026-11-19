-- Bilan des accidents corporels à Luynes depuis 2005, comparé à l'Indre-et-Loire.
-- Résultat : src/data/generated/accidents_resume.json (une ligne).
WITH periode AS (
  SELECT min(annee) AS debut, max(annee) AS fin, count(DISTINCT annee) AS nb_annees FROM accidents
),

-- Accidents par commune sur toute la période, rapportés à la population actuelle (taux pour 1 000 habitants et par an)
par_commune AS (
  SELECT
    c.code,
    c.population,
    count(a.num_acc) AS accidents,
    1000.0 * count(a.num_acc) / c.population / (SELECT nb_annees FROM periode) AS taux
  FROM communes_37 c
  LEFT JOIN accidents a ON a.code_commune = c.code
  GROUP BY c.code, c.population
),

classement AS (
  SELECT code, taux, rank() OVER (ORDER BY taux DESC) AS rang, count(*) OVER () AS nb_communes FROM par_commune
),

luynes AS (
  SELECT
    count(*)                                                 AS accidents,
    count(*) FILTER (gravite = 'mortel')                     AS mortels,
    count(*) FILTER (gravite = 'grave')                      AS graves,
    count(*) FILTER (gravite = 'leger')                      AS legers,
    sum(tues)                                                AS tues,
    sum(hospitalises)                                        AS hospitalises,
    sum(blesses_legers)                                      AS blesses_legers,
    count(lat)                                               AS geolocalises,
    count(*) FILTER (annee > (SELECT fin FROM periode) - 5)  AS accidents_5_ans,
    count(*) FILTER (annee <= (SELECT debut FROM periode) + 4) AS accidents_5_premieres_annees,
    count(*) FILTER (annee = (SELECT fin FROM periode))      AS accidents_derniere_annee
  FROM accidents_complet
  WHERE est_luynes
),

-- Années sans aucun accident corporel à Luynes
annees_sans AS (
  SELECT count(*) AS nb
  FROM range((SELECT debut FROM periode), (SELECT fin FROM periode) + 1) AS t(annee)
  WHERE annee NOT IN (SELECT annee FROM accidents WHERE est_luynes)
),

departement AS (
  SELECT
    1000.0 * count(*) / (SELECT sum(population) FROM communes_37) / (SELECT nb_annees FROM periode) AS taux,
    100.0 * count(*) FILTER (gravite IN ('mortel', 'grave')) / count(*)                           AS part_graves
  FROM accidents_complet
)

SELECT
  p.debut::INTEGER                                            AS annee_debut,
  p.fin::INTEGER                                              AS annee_fin,
  p.nb_annees::INTEGER                                        AS nb_annees,
  l.accidents::INTEGER                                        AS accidents,
  l.mortels::INTEGER                                          AS accidents_mortels,
  l.graves::INTEGER                                           AS accidents_graves,
  l.legers::INTEGER                                           AS accidents_legers,
  l.tues::INTEGER                                             AS tues,
  l.hospitalises::INTEGER                                     AS hospitalises,
  l.blesses_legers::INTEGER                                   AS blesses_legers,
  l.geolocalises::INTEGER                                     AS accidents_geolocalises,
  l.accidents_5_ans::INTEGER                                  AS accidents_5_ans,
  l.accidents_5_premieres_annees::INTEGER                     AS accidents_5_premieres_annees,
  l.accidents_derniere_annee::INTEGER                         AS accidents_derniere_annee,
  s.nb::INTEGER                                               AS annees_sans_accident,
  round(k.taux, 2)::DOUBLE                                    AS taux_luynes,
  round(d.taux, 2)::DOUBLE                                    AS taux_37,
  round(100.0 * (l.mortels + l.graves) / l.accidents, 1)::DOUBLE AS part_graves_luynes,
  round(d.part_graves, 1)::DOUBLE                             AS part_graves_37,
  k.rang::INTEGER                                             AS rang_taux,
  k.nb_communes::INTEGER                                      AS nb_communes
FROM periode p, luynes l, annees_sans s, departement d, classement k
WHERE k.code = '37139';
