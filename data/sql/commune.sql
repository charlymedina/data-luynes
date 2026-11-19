-- Fiche d'identité de Luynes.
-- Résultat : src/data/generated/commune.json (une ligne).
SELECT
  nom,
  code                                        AS code_insee,
  codesPostaux[1]                             AS code_postal,   -- les listes DuckDB commencent à 1
  population::INTEGER                         AS population,
  round(surface / 100, 1)::DOUBLE             AS surface_km2,   -- l'API donne la surface en hectares
  round(population / (surface / 100))::INTEGER AS densite_hab_km2,
  departement.nom                             AS departement,
  region.nom                                  AS region
FROM read_json('data/raw/commune.json');
