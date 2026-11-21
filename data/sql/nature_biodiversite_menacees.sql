-- Espèces observées à Luynes et classées « vulnérable », « en danger » ou « en danger critique » sur la liste rouge
-- MONDIALE de l'UICN (le statut en France ou dans la région peut différer). Source : GBIF.
-- Résultat : src/data/generated/nature_biodiversite_menacees.json
SELECT
  regexp_extract(valeur, '^(\S+ \S+)', 1) AS espece,
  observations
FROM nature_gbif_facette('data/raw/nature_gbif_menacees.json', 'SCIENTIFIC_NAME')
ORDER BY observations DESC;
