-- Vignobles : parcelles de Luynes délimitées pour produire une AOC viticole (INAO), par appellation.
-- « Délimitation parcellaire » = les parcelles autorisées à produire l'appellation ; cela ne dit pas qu'elles sont plantées
-- (les vignes réellement déclarées sont comptées à part, dans nature_cultures). Aucune extrapolation.
-- Une parcelle peut porter plusieurs appellations à la fois : on les sépare, une ligne par appellation.
-- Résultat : src/data/generated/nature_aoc.json (une ligne par appellation).
WITH appellations AS (
  SELECT trim(unnest(string_split(denominations, ','))) AS appellation, geom
  FROM nature_aoc
)
SELECT
  appellation,
  round(ST_Area(ST_Transform(ST_Union_Agg(geom), 'EPSG:4326', 'EPSG:2154', always_xy := true)) / 10000, 1)::DOUBLE AS surface_ha
FROM appellations
GROUP BY appellation
ORDER BY surface_ha DESC, appellation;
