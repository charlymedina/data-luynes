-- Vues partagées du thème « Nature & paysages » (fichier « _ » : exécuté en premier, ne produit pas de JSON).
-- (Le nom commence par « _spatial » pour passer APRÈS _spatial.sql, qui charge l'extension de calcul géographique.)
-- Toutes les formes géographiques sont téléchargées « autour » de Luynes (un rectangle) puis DÉCOUPÉES ici
-- au contour exact de la commune : seuls les hectares réellement situés à Luynes sont comptés.
-- Les surfaces sont calculées en Lambert 93 (EPSG:2154), la projection officielle en mètres pour la France.

-- 1) La commune : sa forme (GPS, EPSG:4326) et sa surface en hectares.
CREATE OR REPLACE VIEW nature_commune AS
SELECT
  geom,
  ST_Area(ST_Transform(geom, 'EPSG:4326', 'EPSG:2154', always_xy := true)) / 10000 AS surface_ha
FROM (SELECT ST_GeomFromGeoJSON(to_json(geometry)) AS geom FROM read_json('data/raw/commune_contour.json'));

-- 2) Espaces protégés ou inventoriés (INPN / MNHN), découpés à la limite de la commune.
--    Une ligne = une zone ; on garde celles dont une partie est bien à Luynes (plus d'un hectare, pour écarter les
--    simples frôlements de frontière).
CREATE OR REPLACE VIEW nature_zonages AS
WITH brutes AS (
  SELECT 'znieff1' AS type, f.properties.nom AS nom, f.properties.url AS url, f.geometry AS geometrie
  FROM (SELECT unnest(features) AS f FROM read_json('data/raw/nature_znieff1.json'))
  UNION ALL
  SELECT 'znieff2', f.properties.nom, f.properties.url, f.geometry
  FROM (SELECT unnest(features) AS f FROM read_json('data/raw/nature_znieff2.json'))
  UNION ALL
  SELECT 'natura_habitats', f.properties.sitename, f.properties.url, f.geometry
  FROM (SELECT unnest(features) AS f FROM read_json('data/raw/nature_natura_habitats.json'))
  UNION ALL
  SELECT 'natura_oiseaux', f.properties.sitename, f.properties.url, f.geometry
  FROM (SELECT unnest(features) AS f FROM read_json('data/raw/nature_natura_oiseaux.json'))
),
decoupees AS (
  SELECT b.type, b.nom, b.url, ST_CollectionExtract(ST_Intersection(ST_MakeValid(ST_GeomFromGeoJSON(to_json(b.geometrie))), c.geom), 3) AS geom
  FROM brutes b, nature_commune c
)
SELECT
  type, nom, url, geom,
  ST_Area(ST_Transform(geom, 'EPSG:4326', 'EPSG:2154', always_xy := true)) / 10000 AS surface_ha
FROM decoupees
WHERE NOT ST_IsEmpty(geom)
  AND ST_Area(ST_Transform(geom, 'EPSG:4326', 'EPSG:2154', always_xy := true)) > 10000;

-- 3) Parcelles agricoles déclarées (RPG), découpées à la limite de la commune.
--    Deux millésimes : le plus récent (nature_rpg) et un plus ancien (nature_rpg_ancien), pour l'évolution.
CREATE OR REPLACE VIEW nature_parcelles AS
WITH brutes AS (
  SELECT 'recent' AS periode, f.properties.code_cultu AS code_culture, f.properties.code_group AS code_groupe, f.geometry AS geometrie
  FROM (SELECT unnest(features) AS f FROM read_json('data/raw/nature_rpg.json', maximum_object_size = 100000000))
  UNION ALL
  SELECT 'ancien', f.properties.code_cultu, f.properties.code_group, f.geometry
  FROM (SELECT unnest(features) AS f FROM read_json('data/raw/nature_rpg_ancien.json', maximum_object_size = 100000000))
),
decoupees AS (
  SELECT b.periode, b.code_culture, b.code_groupe,
         ST_CollectionExtract(ST_Intersection(ST_MakeValid(ST_GeomFromGeoJSON(to_json(b.geometrie))), c.geom), 3) AS geom
  FROM brutes b, nature_commune c
)
SELECT
  periode, code_culture, code_groupe,
  ST_Area(ST_Transform(geom, 'EPSG:4326', 'EPSG:2154', always_xy := true)) / 10000 AS surface_ha
FROM decoupees
WHERE NOT ST_IsEmpty(geom);

-- 4) Libellés des cultures du RPG (code → nom, groupe).
CREATE OR REPLACE VIEW nature_cultures_codes AS
SELECT
  f.properties.code_culture AS code_culture,
  f.properties.libelle_culture AS libelle_culture,
  f.properties.code_groupe_culture AS code_groupe,
  f.properties.libelle_groupe_culture AS libelle_groupe
FROM (SELECT unnest(features) AS f FROM read_json('data/raw/nature_rpg_cultures.json'));

-- 5) Vignobles : parcelles délimitées pour produire une AOC viticole (INAO), découpées à la commune.
CREATE OR REPLACE VIEW nature_aoc AS
WITH brutes AS (
  SELECT f.properties.denom AS denominations, f.geometry AS geometrie
  FROM (SELECT unnest(features) AS f FROM read_json('data/raw/nature_aoc_viticoles.json', maximum_object_size = 100000000))
),
decoupees AS (
  SELECT b.denominations, ST_CollectionExtract(ST_Intersection(ST_MakeValid(ST_GeomFromGeoJSON(to_json(b.geometrie))), c.geom), 3) AS geom
  FROM brutes b, nature_commune c
)
SELECT
  denominations, geom,
  ST_Area(ST_Transform(geom, 'EPSG:4326', 'EPSG:2154', always_xy := true)) / 10000 AS surface_ha
FROM decoupees
WHERE NOT ST_IsEmpty(geom);
