-- Les voies qui évoquent d'autres communes : villes jumelées avec Luynes et autre Luynes (table de correspondance).
-- Résultat : src/data/generated/rues_ailleurs.json
SELECT
  nom,
  sujet,
  nature,
  description,
  adresses::INTEGER AS adresses
FROM rues_reference
WHERE nature IN ('ville_jumelle', 'homonyme')
ORDER BY nature DESC, sujet;
