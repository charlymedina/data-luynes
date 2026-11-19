-- Les records et repères de la série historique, pour les phrases « Le saviez-vous ? ».
-- Résultat : src/data/generated/population_faits.json (une seule ligne).
WITH serie AS (
  SELECT annee::INTEGER AS annee, population::INTEGER AS population
  FROM read_json('data/raw/population_historique.json')
),

dernier   AS (SELECT * FROM serie ORDER BY annee DESC LIMIT 1),
precedent AS (SELECT * FROM serie ORDER BY annee DESC LIMIT 1 OFFSET 1),
premier   AS (SELECT * FROM serie ORDER BY annee LIMIT 1),
pic       AS (SELECT * FROM serie ORDER BY population DESC LIMIT 1),
creux     AS (SELECT * FROM serie ORDER BY population LIMIT 1),
en_1968   AS (SELECT * FROM serie WHERE annee = 1968),   -- 1968 : point de départ classique des comparaisons INSEE

-- Période où Luynes a gagné le plus d'habitants par an, entre deux recensements successifs
hausses AS (
  SELECT
    lag(annee) OVER (ORDER BY annee) AS annee_debut,
    annee                            AS annee_fin,
    (population - lag(population) OVER (ORDER BY annee))
      / (annee - lag(annee) OVER (ORDER BY annee))        AS gain_par_an
  FROM serie
),
plus_forte_hausse AS (
  SELECT * FROM hausses WHERE gain_par_an IS NOT NULL ORDER BY gain_par_an DESC LIMIT 1
)

SELECT
  dernier.annee                                       AS annee_derniere,
  dernier.population                                  AS population_derniere,
  precedent.annee                                     AS annee_precedente,
  precedent.population                                AS population_precedente,
  premier.annee                                       AS annee_premiere,
  premier.population                                  AS population_premiere,
  pic.annee                                           AS annee_pic,
  pic.population                                      AS population_pic,
  creux.annee                                         AS annee_creux,
  creux.population                                    AS population_creux,
  round(dernier.population / en_1968.population, 1)::DOUBLE AS multiplie_depuis_1968,
  plus_forte_hausse.annee_debut                       AS hausse_annee_debut,
  plus_forte_hausse.annee_fin                         AS hausse_annee_fin,
  round(plus_forte_hausse.gain_par_an)::INTEGER       AS hausse_par_an
FROM dernier, precedent, premier, pic, creux, en_1968, plus_forte_hausse;
