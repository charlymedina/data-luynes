-- Défibrillateurs (Géo'DAE) à Luynes, comparés à l'Indre-et-Loire : nombre, pour 1 000 habitants, rang.
-- Les communes sans défibrillateur comptent pour 0. Rang 1 = le plus de défibrillateurs par habitant.
-- « permanent » : la base indique un accès 24 h/24 (valeur « 24/7 ») ; « exterieur » : posé à l'extérieur d'un bâtiment.
-- Résultat : src/data/generated/quotidien_dae_resume.json (une ligne)
WITH par_commune AS (
  SELECT c.code, c.population, count(d.code) AS nb
  FROM communes_37 c
  LEFT JOIN quotidien_dae d ON d.code = c.code AND NOT d.mobile
  GROUP BY c.code, c.population
),
classement AS (
  SELECT code, nb, 1000 * nb / population AS pour_1000,
         rank() OVER (ORDER BY nb / population DESC) AS rang,
         count(*) OVER () AS nb_communes
  FROM par_commune
)
SELECT
  k.nb::INTEGER                                                              AS defibrillateurs,
  (SELECT count(*) FILTER (exterieur) FROM quotidien_dae WHERE code = '37139')::INTEGER AS exterieurs,
  (SELECT count(*) FILTER (permanent) FROM quotidien_dae WHERE code = '37139')::INTEGER AS permanents,
  (SELECT count(*) FILTER (exterieur AND permanent) FROM quotidien_dae WHERE code = '37139')::INTEGER AS exterieurs_permanents,
  round(k.pour_1000, 1)::DOUBLE                                              AS pour_1000,
  round(1000 * (SELECT sum(nb) FROM par_commune) / (SELECT sum(population) FROM communes_37), 1)::DOUBLE AS pour_1000_37,
  k.rang::INTEGER                                                            AS rang,
  k.nb_communes::INTEGER                                                     AS nb_communes,
  (SELECT sum(nb) FROM par_commune)::INTEGER                                 AS total_37,
  (SELECT count(*) FROM par_commune WHERE nb = 0)::INTEGER                   AS communes_sans
FROM classement k
WHERE k.code = '37139';
