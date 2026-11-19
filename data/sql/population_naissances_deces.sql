-- Naissances et décès des habitants de Luynes, année par année (état civil INSEE).
-- Le « solde naturel » = naissances - décès : positif, la commune gagne des habitants par les naissances.
-- Résultat : src/data/generated/population_naissances_deces.json (une ligne par année).
WITH naissances AS (
  SELECT
    o.dimensions.TIME_PERIOD::INTEGER          AS annee,
    o.measures.OBS_VALUE_NIVEAU.value::INTEGER AS nombre
  FROM (SELECT unnest(observations) AS o FROM read_json('data/raw/naissances_luynes.json'))
),

deces AS (
  SELECT
    o.dimensions.TIME_PERIOD::INTEGER          AS annee,
    o.measures.OBS_VALUE_NIVEAU.value::INTEGER AS nombre
  FROM (SELECT unnest(observations) AS o FROM read_json('data/raw/deces_luynes.json'))
)

SELECT
  annee,
  naissances.nombre                 AS naissances,
  deces.nombre                      AS deces,
  naissances.nombre - deces.nombre  AS solde_naturel
FROM naissances
JOIN deces USING (annee)
ORDER BY annee;
