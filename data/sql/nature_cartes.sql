-- Formes à afficher sur la carte du thème, déjà découpées à la limite de la commune et allégées (~5 m).
--   zones protégées : ZNIEFF (I et II) et Natura 2000 (habitats et oiseaux), chacune réunie en une seule forme ;
--   cultures : prairies permanentes (RPG) ; vignobles : parcelles délimitées pour produire une AOC (INAO).
-- Résultat : src/data/generated/nature_cartes.json (une ligne par couche).
WITH prairies AS (
  -- Les parcelles du RPG sont relues ici avec leur forme (la vue nature_parcelles ne garde que les surfaces).
  SELECT ST_CollectionExtract(ST_Intersection(ST_MakeValid(ST_GeomFromGeoJSON(to_json(f.geometry))), c.geom), 3) AS geom
  FROM (SELECT unnest(features) AS f FROM read_json('data/raw/nature_rpg.json', maximum_object_size = 100000000)), nature_commune c
  WHERE f.properties.code_group = '18'
),
couches AS (
  SELECT 'znieff'  AS couche, ST_Union_Agg(geom) AS geom FROM nature_zonages WHERE type IN ('znieff1', 'znieff2')
  UNION ALL
  SELECT 'natura', ST_Union_Agg(geom) FROM nature_zonages WHERE type IN ('natura_habitats', 'natura_oiseaux')
  UNION ALL
  SELECT 'prairies', ST_Union_Agg(geom) FROM prairies
  UNION ALL
  SELECT 'vignobles', ST_Union_Agg(geom) FROM nature_aoc
)
SELECT
  couche,
  round(ST_Area(ST_Transform(geom, 'EPSG:4326', 'EPSG:2154', always_xy := true)) / 10000)::INTEGER AS surface_ha,
  ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, 0.00005))::JSON AS forme
FROM couches
WHERE geom IS NOT NULL AND NOT ST_IsEmpty(geom);
