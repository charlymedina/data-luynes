-- Chiffres clés du thème « Nature & paysages » (une ligne) : espaces protégés, cultures, vignobles.
-- Toutes les surfaces sont celles situées DANS Luynes (formes découpées au contour de la commune, voir _spatial_nature.sql).
-- Les zones se chevauchent (une ZNIEFF et un site Natura 2000 couvrent en partie le même terrain) : on réunit
-- les formes avant de mesurer, pour ne jamais compter deux fois le même hectare.
-- Résultat : src/data/generated/nature_resume.json
WITH commune AS (SELECT surface_ha FROM nature_commune),
union_zones AS (
  SELECT
    ST_Union_Agg(geom) FILTER (WHERE type LIKE 'natura%') AS natura,
    ST_Union_Agg(geom) FILTER (WHERE type LIKE 'znieff%') AS znieff,
    ST_Union_Agg(geom)                                    AS toutes
  FROM nature_zonages
),
surfaces AS (
  SELECT
    coalesce(ST_Area(ST_Transform(natura, 'EPSG:4326', 'EPSG:2154', always_xy := true)) / 10000, 0) AS natura_ha,
    coalesce(ST_Area(ST_Transform(znieff, 'EPSG:4326', 'EPSG:2154', always_xy := true)) / 10000, 0) AS znieff_ha,
    coalesce(ST_Area(ST_Transform(toutes, 'EPSG:4326', 'EPSG:2154', always_xy := true)) / 10000, 0) AS zonee_ha
  FROM union_zones
),
agricole AS (
  SELECT
    sum(surface_ha) FILTER (WHERE periode = 'recent')                         AS declaree_ha,
    sum(surface_ha) FILTER (WHERE periode = 'ancien')                         AS declaree_ancienne_ha,
    sum(surface_ha) FILTER (WHERE periode = 'recent' AND code_groupe = '18')  AS prairies_permanentes_ha,
    sum(surface_ha) FILTER (WHERE periode = 'recent' AND code_groupe = '21')  AS vignes_ha,
    sum(surface_ha) FILTER (WHERE periode = 'ancien' AND code_groupe = '21')  AS vignes_ancien_ha,
    count(DISTINCT code_groupe) FILTER (WHERE periode = 'recent')             AS nb_familles
  FROM nature_parcelles
),
aoc AS (
  SELECT coalesce(ST_Area(ST_Transform(ST_Union_Agg(geom), 'EPSG:4326', 'EPSG:2154', always_xy := true)) / 10000, 0) AS ha
  FROM nature_aoc
)
SELECT
  round(c.surface_ha)::INTEGER                                              AS surface_commune_ha,
  (SELECT count(*) FROM nature_zonages WHERE type LIKE 'znieff%')::INTEGER  AS nb_znieff,
  (SELECT count(*) FROM nature_zonages WHERE type = 'znieff1')::INTEGER     AS nb_znieff1,
  (SELECT count(*) FROM nature_zonages WHERE type = 'znieff2')::INTEGER     AS nb_znieff2,
  (SELECT count(*) FROM nature_zonages WHERE type LIKE 'natura%')::INTEGER  AS nb_natura,
  round(s.zonee_ha)::INTEGER                                                AS zonee_ha,
  round(100 * s.zonee_ha / c.surface_ha, 1)::DOUBLE                         AS zonee_pct,
  round(100 * s.natura_ha / c.surface_ha, 1)::DOUBLE                        AS natura_pct,
  round(100 * s.znieff_ha / c.surface_ha, 1)::DOUBLE                        AS znieff_pct,
  (SELECT annee FROM read_json('data/raw/nature_rpg_annee.json'))::INTEGER  AS annee_rpg,
  (SELECT annee_ancienne FROM read_json('data/raw/nature_rpg_annee.json'))::INTEGER AS annee_rpg_ancienne,
  round(a.declaree_ha)::INTEGER                                             AS agricole_ha,
  round(100 * a.declaree_ha / c.surface_ha, 1)::DOUBLE                      AS agricole_pct,
  round(a.declaree_ancienne_ha)::INTEGER                                    AS agricole_ancienne_ha,
  round(100 * a.declaree_ancienne_ha / c.surface_ha, 1)::DOUBLE             AS agricole_ancienne_pct,
  round(a.prairies_permanentes_ha)::INTEGER                                 AS prairies_ha,
  round(100 * a.prairies_permanentes_ha / a.declaree_ha, 1)::DOUBLE         AS prairies_part_agricole_pct,
  round(a.vignes_ha, 1)::DOUBLE                                             AS vignes_ha,
  round(a.vignes_ancien_ha, 1)::DOUBLE                                      AS vignes_ancienne_ha,
  a.nb_familles::INTEGER                                                    AS nb_familles,
  round(aoc.ha)::INTEGER                                                    AS aoc_ha,
  round(100 * aoc.ha / c.surface_ha, 1)::DOUBLE                             AS aoc_pct,
  (SELECT count(*) FROM (SELECT DISTINCT trim(unnest(string_split(denominations, ','))) FROM nature_aoc))::INTEGER AS aoc_nb_appellations
FROM commune c, surfaces s, agricole a, aoc;
