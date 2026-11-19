-- Les 272 communes d'Indre-et-Loire classées de la plus dense à la moins dense
-- (pour le graphique « Luynes parmi les communes du département » de la page Territoire).
-- Résultat : src/data/generated/territoire_communes.json (une ligne par commune).
SELECT
  rank() OVER (ORDER BY densite_hab_km2 DESC)::INTEGER AS rang_densite,
  nom,
  population::INTEGER                                  AS population,
  round(surface_km2, 1)::DOUBLE                        AS surface_km2,
  round(densite_hab_km2)::INTEGER                      AS densite_hab_km2,
  est_luynes
FROM communes_37
ORDER BY densite_hab_km2 DESC;
