-- Mobilier et services urbains de Luynes (portail open data de Tours Métropole) :
--  - bancs publics (inventaire inégal selon les communes de la métropole : pas de comparaison),
--  - points d'apport volontaire du verre : comparés aux 23 communes de la métropole qui en ont (habitants par point),
--  - point d'apport volontaire du textile.
-- Rang 1 = le moins d'habitants par point de verre (le mieux fourni).
-- Résultat : src/data/generated/quotidien_mobilier.json (une ligne)
WITH par_commune AS (
  SELECT v.code, count(*) AS points, any_value(c.population) AS population
  FROM quotidien_verre v
  JOIN communes_37 c ON c.code = v.code
  GROUP BY v.code
),
classement AS (
  SELECT code, points, population, population / points AS habitants_par_point,
         rank() OVER (ORDER BY population / points) AS rang, count(*) OVER () AS nb_communes
  FROM par_commune
)
SELECT
  (SELECT count(*) FROM read_json('data/raw/quotidien_bancs_luynes.json'))::INTEGER      AS bancs,
  (SELECT count(*) FROM read_json('data/raw/quotidien_textile_luynes.json'))::INTEGER    AS textile,
  k.points::INTEGER                                                                      AS verre,
  round(k.habitants_par_point)::INTEGER                                                  AS verre_habitants_par_point,
  round(sum(m.population) / sum(m.points))::INTEGER                                      AS verre_habitants_par_point_metropole,
  k.rang::INTEGER                                                                        AS verre_rang,
  k.nb_communes::INTEGER                                                                 AS verre_nb_communes,
  sum(m.points)::INTEGER                                                                 AS verre_points_metropole
FROM classement k, par_commune m
WHERE k.code = '37139'
GROUP BY k.points, k.habitants_par_point, k.rang, k.nb_communes;
