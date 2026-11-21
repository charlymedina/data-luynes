-- Un point par nom de voie ou de lieu-dit (l'adresse la plus proche du milieu), pour la carte.
-- Résultat : src/data/generated/rues_carte.json
SELECT
  nom,
  type_voie AS type,
  est_voie  AS voie,
  adresses::INTEGER AS adresses,
  round(lat, 6)::DOUBLE AS lat,
  round(lon, 6)::DOUBLE AS lon
FROM rues_noms
ORDER BY est_voie DESC, nom;
