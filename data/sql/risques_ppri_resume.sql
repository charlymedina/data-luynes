-- PPRi de la Loire à Luynes : surface totale réglementée, part de la commune et date d'approbation.
-- La date vient du règlement du plan (nom du fichier du règlement publié avec les données : « …_AAAAMMJJ.pdf »),
-- qui est aussi la date d'approbation donnée par la DDT dans la description du jeu de données.
-- Résultat : src/data/generated/risques_ppri_resume.json (une ligne).
SELECT
  round(sum(ST_Area(ST_Transform(z.geom, 'EPSG:4326', 'EPSG:2154', always_xy := true))) / 10000, 1)::DOUBLE AS surface_ha,
  round(100 * sum(ST_Area(ST_Transform(z.geom, 'EPSG:4326', 'EPSG:2154', always_xy := true))) / any_value(c.surface_ha * 10000), 1)::DOUBLE AS part_commune_pct,
  count(DISTINCT z.code)::INTEGER AS nb_codes,
  strptime(max(z.date_reglement), '%Y%m%d')::DATE::VARCHAR AS date_approbation
FROM ppri_zones_commune z, nature_commune c;
