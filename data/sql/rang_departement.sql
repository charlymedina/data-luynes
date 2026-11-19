-- Où se situe Luynes parmi les communes d'Indre-et-Loire ?
-- Résultat : src/data/generated/rang_departement.json (une ligne).
WITH communes AS (
  SELECT
    code,
    population,
    surface / 100 AS surface_km2
  FROM read_json('data/raw/communes_37.json')
  WHERE population IS NOT NULL
),

classement AS (
  SELECT
    code,
    rank() OVER (ORDER BY population DESC)  AS rang_population,
    rank() OVER (ORDER BY surface_km2 DESC) AS rang_surface,
    count(*)          OVER ()               AS nb_communes,
    sum(population)   OVER ()               AS population_departement,
    sum(surface_km2)  OVER ()               AS surface_departement
  FROM communes
)

SELECT
  rang_population::INTEGER                                     AS rang_population,
  rang_surface::INTEGER                                        AS rang_surface,
  nb_communes::INTEGER                                         AS nb_communes,
  round(population_departement / surface_departement)::INTEGER AS densite_departement
FROM classement
WHERE code = '37139';
