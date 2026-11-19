-- Nombre d'entreprises créées à Luynes chaque année (toutes activités, toutes formes, micro-entreprises comprises).
-- Résultat : src/data/generated/revenus_creations.json (une ligne par année).
SELECT
  o.dimensions.TIME_PERIOD::INTEGER                  AS annee,
  round(o.measures.OBS_VALUE_NIVEAU.value)::INTEGER  AS creations
FROM (SELECT unnest(observations) AS o FROM read_json('data/raw/creations_entreprises.json'))
WHERE o.measures.OBS_VALUE_NIVEAU.value IS NOT NULL
ORDER BY annee;
