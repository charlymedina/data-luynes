-- Contour de la commune (API Géo / IGN), pour dessiner la limite de Luynes sur les cartes.
-- Résultat : src/data/generated/patrimoine_contour.json (une ligne : la géométrie GeoJSON).
SELECT geometry AS contour
FROM read_json('data/raw/commune_contour.json');
