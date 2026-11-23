-- Zones réglementées du PPRi de la Loire (Val de Tours – Val de Luynes) à Luynes : un type de zone par ligne,
-- avec sa forme (découpée à la limite de la commune), sa surface et sa part de la surface communale.
-- Les quatre types regroupent les codes du plan (voir data/sql/_spatial_ppri.sql). Les surfaces sont en Lambert 93.
-- La forme est simplifiée (à ~5 m près) pour rester légère sur la carte.
-- Résultat : src/data/generated/risques_ppri.json (une ligne par type de zone).
SELECT
  z.type_ordre AS ordre,
  CASE z.type_ordre
    WHEN 1 THEN 'Lit de la Loire'
    WHEN 2 THEN 'Derrière les digues'
    WHEN 3 THEN 'Champ d''expansion des crues'
    ELSE 'Quartiers déjà bâtis'
  END AS type,
  CASE z.type_ordre
    WHEN 1 THEN 'lit mineur et lit endigué du fleuve ; inconstructible'
    WHEN 2 THEN 'zone de dissipation de l''énergie, protégée par les digues ; inconstructible sauf exception'
    WHEN 3 THEN 'zone non urbanisée où l''eau peut s''étaler ; inconstructible sauf exception'
    ELSE 'zone déjà urbanisée (dont centre urbain) ; constructible sous conditions'
  END AS regle,
  count(*)::INTEGER AS morceaux,
  list(DISTINCT z.code ORDER BY z.code) AS codes,
  round(sum(ST_Area(ST_Transform(z.geom, 'EPSG:4326', 'EPSG:2154', always_xy := true))) / 10000, 1)::DOUBLE AS surface_ha,
  round(100 * sum(ST_Area(ST_Transform(z.geom, 'EPSG:4326', 'EPSG:2154', always_xy := true))) / any_value(c.surface_ha * 10000), 1)::DOUBLE AS part_commune_pct,
  ST_AsGeoJSON(ST_SimplifyPreserveTopology(ST_Union_Agg(z.geom), 0.00005))::JSON AS zone
FROM ppri_zones_commune z, nature_commune c
GROUP BY z.type_ordre
ORDER BY z.type_ordre;
