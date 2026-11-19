-- Vues partagées sur les 272 communes d'Indre-et-Loire (fichier « _ » : exécuté en premier, ne produit pas de JSON).

-- 1) Fiche de chaque commune (API Géo) : population légale, superficie, densité.
CREATE OR REPLACE VIEW communes_37 AS
SELECT
  code,
  nom,
  population,
  surface / 100              AS surface_km2,      -- l'API donne la surface en hectares
  population / (surface / 100) AS densite_hab_km2,
  code = '37139'             AS est_luynes
FROM read_json('data/raw/communes_37.json')
WHERE population IS NOT NULL;

-- 2) Âges de chaque commune à chaque recensement (INSEE Melodi) : une ligne par commune et par année.
CREATE OR REPLACE VIEW ages_communes_37 AS
WITH observations AS (
  SELECT unnest(observations) AS o FROM read_json('data/raw/ages_communes_37.json')
)
SELECT
  right(o.dimensions.GEO, 5)                                       AS code,  -- « 2026-COM-37139 » → « 37139 »
  o.dimensions.TIME_PERIOD::INTEGER                                AS annee,
  sum(o.measures.OBS_VALUE_NIVEAU.value) FILTER (o.dimensions.AGE = '_T')     AS population,
  sum(o.measures.OBS_VALUE_NIVEAU.value) FILTER (o.dimensions.AGE = 'Y_LT20') AS moins_20,
  sum(o.measures.OBS_VALUE_NIVEAU.value) FILTER (o.dimensions.AGE = 'Y_GE65') AS plus_65
FROM observations
GROUP BY ALL;
