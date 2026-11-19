-- Luynes et ses 7 communes voisines les plus proches (distance entre les centres-villes),
-- triées de la plus peuplée à la moins peuplée.
-- Résultat : src/data/generated/voisines.json
WITH communes AS (
  SELECT
    code,
    nom,
    population,
    centre.coordinates[1] AS lon,   -- GeoJSON : [longitude, latitude]
    centre.coordinates[2] AS lat
  FROM read_json('data/raw/communes_37.json')
  WHERE population IS NOT NULL
),

luynes AS (
  SELECT lon, lat FROM communes WHERE code = '37139'
),

avec_distance AS (
  SELECT
    c.code,
    c.nom,
    c.population,
    -- Formule de haversine : distance « à vol d'oiseau » en km sur la Terre (rayon 6 371 km)
    2 * 6371 * asin(sqrt(
        pow(sin(radians(c.lat - l.lat) / 2), 2)
      + cos(radians(l.lat)) * cos(radians(c.lat)) * pow(sin(radians(c.lon - l.lon) / 2), 2)
    )) AS distance_km
  FROM communes c
  CROSS JOIN luynes l
  ORDER BY distance_km
  LIMIT 8   -- Luynes elle-même (distance 0) + 7 voisines
)

SELECT
  code,
  nom,
  population::INTEGER          AS population,
  round(distance_km, 1)::DOUBLE AS distance_km,
  code = '37139'               AS est_luynes
FROM avec_distance
ORDER BY population DESC;
