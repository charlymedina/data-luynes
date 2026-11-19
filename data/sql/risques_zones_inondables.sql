-- Zone inondable de la Loire à Luynes (crue de référence, scénario « moyen » de la directive inondation),
-- découpée à la limite de la commune, et part de la commune qu'elle couvre.
-- (Le scénario « extrême » a été comparé : il couvre exactement la même surface à Luynes, le coteau
-- bloquant l'eau au même endroit ; on ne garde donc que le scénario de référence.)
-- Les surfaces sont calculées en Lambert 93 (EPSG:2154), la projection officielle en mètres pour la France.
-- La forme est simplifiée (à ~5 m près) pour rester légère sur la carte.
-- Résultat : src/data/generated/risques_zones_inondables.json (une ligne).
WITH commune AS (
  SELECT ST_GeomFromGeoJSON(to_json(geometry)) AS geom
  FROM read_json('data/raw/commune_contour.json')
),
zones AS (
  SELECT ST_MakeValid(ST_GeomFromGeoJSON(to_json(f.geometry))) AS geom
  FROM (SELECT unnest(features) AS f FROM read_json('data/raw/zones_inondables.json', maximum_object_size = 100000000))
),
zone_luynes AS (
  SELECT ST_Intersection(ST_Union_Agg(z.geom), any_value(c.geom)) AS geom, any_value(c.geom) AS commune
  FROM zones z, commune c
)
SELECT
  round(ST_Area(ST_Transform(geom, 'EPSG:4326', 'EPSG:2154', always_xy := true)) / 10000)::INTEGER AS surface_ha,
  round(100 * ST_Area(ST_Transform(geom, 'EPSG:4326', 'EPSG:2154', always_xy := true))
            / ST_Area(ST_Transform(commune, 'EPSG:4326', 'EPSG:2154', always_xy := true)), 1)::DOUBLE AS part_commune_pct,
  ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, 0.00005))::JSON AS zone
FROM zone_luynes;
