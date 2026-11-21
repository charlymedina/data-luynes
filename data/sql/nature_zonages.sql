-- Espaces protégés ou inventoriés qui recouvrent une partie de Luynes (ZNIEFF, Natura 2000), du plus grand au plus petit.
-- Source : INPN / MNHN (via API Carto de l'IGN). La zone est découpée au contour exact de la commune (voir _spatial_nature.sql) :
-- « surface_ha » = hectares situés à Luynes, pas la surface totale de la zone (qui déborde sur d'autres communes).
-- Résultat : src/data/generated/nature_zonages.json (une ligne par zone).
SELECT
  z.type,
  CASE z.type
    WHEN 'znieff1'         THEN 'ZNIEFF de type I'
    WHEN 'znieff2'         THEN 'ZNIEFF de type II'
    WHEN 'natura_habitats' THEN 'Natura 2000 · habitats'
    WHEN 'natura_oiseaux'  THEN 'Natura 2000 · oiseaux'
  END AS type_libelle,
  z.nom,
  z.url,
  round(z.surface_ha, 1)::DOUBLE AS surface_ha,
  round(100 * z.surface_ha / c.surface_ha, 1)::DOUBLE AS part_commune_pct
FROM nature_zonages z, nature_commune c
ORDER BY z.surface_ha DESC;
