-- Objets mobiliers protégés conservés à Luynes (base Palissy), du plus ancien au plus récent.
-- Résultat : src/data/generated/patrimoine_objets.json (une ligne par notice)
SELECT reference, nom, denomination, lieu, siecle, annee_protection, protection, proprietaire
FROM patrimoine_objets
ORDER BY siecle, annee_protection, nom;
