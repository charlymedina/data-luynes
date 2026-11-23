-- L'âge du bâti de Luynes d'après la BD TOPO (IGN) : combien de bâtiments, combien sont dates, le plus ancien, le plus haut.
-- La date de construction n'est connue que pour une partie des bâtiments (voir _spatial_patrimoine.sql) :
-- les parts sont donc données « parmi les bâtiments dates » et la part de bâtiments dates est publiée à côté.
-- Résultat : src/data/generated/patrimoine_bati_resume.json (une ligne).
WITH
dates AS (SELECT * FROM bati_batiments WHERE annee_apparition IS NOT NULL),
plus_ancien AS (
  SELECT annee_apparition AS annee, coalesce(nullif(usage_principal, 'Indifférencié'), 'bâtiment') AS usage
  FROM dates ORDER BY annee_apparition, residentiel DESC LIMIT 1
),
plus_haut AS (
  SELECT hauteur, nature FROM bati_batiments WHERE hauteur IS NOT NULL ORDER BY hauteur DESC LIMIT 1
)
SELECT
  (SELECT count(*) FROM bati_batiments)::INTEGER                                         AS batiments,
  (SELECT count(*) FROM dates)::INTEGER                                                  AS batiments_dates,
  round(100.0 * (SELECT count(*) FROM dates) / (SELECT count(*) FROM bati_batiments), 1)::DOUBLE AS part_dates_pct,
  (SELECT count(*) FROM bati_batiments WHERE residentiel)::INTEGER                       AS residentiels,
  (SELECT count(*) FROM dates WHERE residentiel)::INTEGER                                AS residentiels_dates,
  round(100.0 * (SELECT count(*) FROM dates WHERE residentiel) / (SELECT count(*) FROM bati_batiments WHERE residentiel), 1)::DOUBLE AS part_residentiels_dates_pct,
  (SELECT annee FROM plus_ancien)::INTEGER                                               AS plus_ancien_annee,
  (SELECT usage FROM plus_ancien)                                                        AS plus_ancien_usage,
  (SELECT max(annee_apparition) FROM dates)::INTEGER                                     AS plus_recent_annee,
  (SELECT median(annee_apparition) FROM dates WHERE residentiel)::INTEGER                AS annee_mediane_residentiels,
  (SELECT hauteur FROM plus_haut)::DOUBLE                                                AS hauteur_max,
  (SELECT nature FROM plus_haut)                                                         AS hauteur_max_nature;
