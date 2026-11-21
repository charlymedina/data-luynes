-- Les noms de voies et de lieux-dits par type (rue, chemin, impasse, place… ; « Lieu-dit ou quartier » = les autres noms).
-- Résultat : src/data/generated/rues_types.json
SELECT
  type_voie            AS type,
  est_voie             AS voie,
  count(*)::INTEGER    AS nombre,
  sum(adresses)::INTEGER AS adresses
FROM rues_noms
GROUP BY type_voie, est_voie
ORDER BY est_voie DESC, nombre DESC, type_voie;
