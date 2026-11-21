-- Biodiversité observée à Luynes (GBIF, observations naturalistes) : chiffres clés (une ligne).
-- Ce sont des espèces OBSERVÉES : un reflet de l'endroit où les gens regardent (et de ceux qui partagent leurs
-- observations), pas un inventaire complet de la faune et de la flore.
-- Contour de la commune simplifié à ~20 m près (limite de longueur d'adresse de l'API GBIF).
-- Résultat : src/data/generated/nature_biodiversite_resume.json
WITH total AS (SELECT count::INTEGER AS observations FROM read_json('data/raw/nature_gbif_resume.json')),
regnes AS (
  SELECT
    sum(observations) FILTER (WHERE valeur = '6') AS plantes,
    sum(observations) FILTER (WHERE valeur = '1') AS animaux,
    sum(observations) FILTER (WHERE valeur = '5') AS champignons
  FROM nature_gbif_facette('data/raw/nature_gbif_resume.json', 'KINGDOM_KEY')
),
humaines AS (
  SELECT sum(observations) FILTER (WHERE valeur = 'HUMAN_OBSERVATION') AS nb
  FROM nature_gbif_facette('data/raw/nature_gbif_resume.json', 'BASIS_OF_RECORD')
)
SELECT
  t.observations,
  (SELECT count(*) FROM nature_gbif_facette('data/raw/nature_gbif_especes.json', 'SPECIES_KEY'))::INTEGER AS especes,
  (SELECT count(*) FROM nature_gbif_facette('data/raw/nature_gbif_menacees.json', 'SCIENTIFIC_NAME'))::INTEGER AS especes_menacees,
  round(100.0 * p.plantes / t.observations, 1)::DOUBLE      AS plantes_pct,
  round(100.0 * p.animaux / t.observations, 1)::DOUBLE      AS animaux_pct,
  p.champignons::INTEGER                                    AS champignons,
  round(100.0 * h.nb / t.observations, 1)::DOUBLE           AS observations_humaines_pct
FROM total t, regnes p, humaines h;
