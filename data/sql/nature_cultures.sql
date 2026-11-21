-- Cultures déclarées à Luynes par grande famille (registre parcellaire graphique, RPG), dernière année et année de comparaison.
-- Surfaces = hectares réellement situés dans la commune (parcelles découpées à son contour, voir _spatial_nature.sql).
-- ⚠ Les cultures tournent d'une année sur l'autre (colza → blé → orge…) : comparer deux années isolées ne dit pas
--   que « tel agriculteur a changé » ; seuls les grands équilibres (prairies, vignes…) se lisent bien.
-- Résultat : src/data/generated/nature_cultures.json (une ligne par famille de cultures).
WITH libelles AS (
  SELECT code_groupe, any_value(libelle_groupe) AS libelle FROM nature_cultures_codes GROUP BY code_groupe
),
par_groupe AS (
  SELECT
    code_groupe,
    sum(surface_ha) FILTER (WHERE periode = 'recent') AS ha_recent,
    sum(surface_ha) FILTER (WHERE periode = 'ancien') AS ha_ancien
  FROM nature_parcelles
  GROUP BY code_groupe
),
totaux AS (
  SELECT sum(ha_recent) AS recent, sum(ha_ancien) AS ancien FROM par_groupe
)
SELECT
  g.code_groupe,
  coalesce(l.libelle, 'Autres cultures') AS famille,
  round(coalesce(g.ha_recent, 0), 1)::DOUBLE AS surface_ha,
  round(100 * coalesce(g.ha_recent, 0) / t.recent, 1)::DOUBLE AS part_surface_agricole_pct,
  round(100 * coalesce(g.ha_recent, 0) / c.surface_ha, 1)::DOUBLE AS part_commune_pct,
  round(coalesce(g.ha_ancien, 0), 1)::DOUBLE AS surface_ancienne_ha
FROM par_groupe g
LEFT JOIN libelles l USING (code_groupe), totaux t, nature_commune c
WHERE coalesce(g.ha_recent, 0) > 0 OR coalesce(g.ha_ancien, 0) > 0
ORDER BY surface_ha DESC;
