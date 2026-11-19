-- Qui est impliqué dans les accidents ? Part des accidents où au moins un piéton, un vélo, une voiture…
-- était impliqué, à Luynes et en Indre-et-Loire (un accident peut compter dans plusieurs lignes).
-- Résultat : src/data/generated/accidents_usagers.json
WITH modes AS (
  SELECT est_luynes, 'voiture' AS mode, 'Voiture ou utilitaire' AS libelle, 1 AS ordre, voiture AS implique FROM accidents_complet
  UNION ALL SELECT est_luynes, 'deux_roues', 'Deux-roues motorisé', 2, deux_roues FROM accidents_complet
  UNION ALL SELECT est_luynes, 'pieton', 'Piéton', 3, pieton FROM accidents_complet
  UNION ALL SELECT est_luynes, 'velo', 'Vélo', 4, velo FROM accidents_complet
  UNION ALL SELECT est_luynes, 'poids_lourd', 'Poids lourd, bus, car', 5, poids_lourd FROM accidents_complet
  UNION ALL SELECT est_luynes, 'trottinette', 'Trottinette', 6, trottinette FROM accidents_complet
)
SELECT
  mode,
  libelle,
  count(*) FILTER (est_luynes AND implique)::INTEGER                                            AS accidents_luynes,
  round(100.0 * count(*) FILTER (est_luynes AND implique) / count(*) FILTER (est_luynes), 1)::DOUBLE AS part_luynes,
  round(100.0 * count(*) FILTER (implique) / count(*), 1)::DOUBLE                               AS part_37
FROM modes
GROUP BY mode, libelle, ordre
ORDER BY ordre;
