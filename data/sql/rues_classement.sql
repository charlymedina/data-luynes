-- Les dix noms (voies ou lieux-dits) qui comptent le plus d'adresses.
-- Résultat : src/data/generated/rues_classement.json
SELECT
  rank() OVER (ORDER BY adresses DESC)::INTEGER AS rang,
  nom,
  type_voie AS type,
  est_voie  AS voie,
  adresses::INTEGER AS adresses
FROM rues_noms
QUALIFY rang <= 10
ORDER BY adresses DESC, nom;
