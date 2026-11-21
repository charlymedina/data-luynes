-- Nombre de notices Palissy par siècle de création (frise des siècles).
-- Résultat : src/data/generated/patrimoine_objets_siecles.json
SELECT siecle, count(*)::INTEGER AS objets
FROM patrimoine_objets
WHERE siecle IS NOT NULL
GROUP BY siecle
ORDER BY siecle;
