-- Vue partagée (fichier commençant par « _ » : exécuté en premier, ne produit pas de JSON).
--
-- Les fichiers INSEE « Melodi » contiennent une liste « observations » ; chaque observation porte
-- des « dimensions » (territoire, année, sexe, âge…) et une valeur. On les met à plat en tableau.

-- Population par âge détaillé (0 à 100 ans et plus) et par sexe, pour Luynes, l'Indre-et-Loire et la France.
-- Les valeurs du recensement sont des estimations : elles ont des décimales, on arrondit à l'affichage.
CREATE OR REPLACE VIEW age_sexe AS
WITH brut AS (
  SELECT 'Luynes' AS territoire, unnest(observations) AS o FROM read_json('data/raw/age_sexe_luynes.json')
  UNION ALL
  SELECT 'Indre-et-Loire', unnest(observations) FROM read_json('data/raw/age_sexe_37.json')
  UNION ALL
  SELECT 'France', unnest(observations) FROM read_json('data/raw/age_sexe_france.json')
)
SELECT
  territoire,
  o.dimensions.TIME_PERIOD::INTEGER AS annee,
  o.dimensions.SEX                  AS sexe,        -- F = femmes, M = hommes
  CASE
    WHEN o.dimensions.AGE = 'Y_GE100' THEN 100      -- « 100 ans et plus »
    ELSE replace(o.dimensions.AGE, 'Y', '')::INTEGER -- « Y37 » → 37
  END                               AS age,
  o.measures.OBS_VALUE_NIVEAU.value AS habitants
FROM brut
WHERE o.dimensions.AGE <> '_T'                      -- on retire la ligne « tous âges »
  AND o.dimensions.SEX IN ('F', 'M')                -- on retire la ligne « deux sexes »
  AND o.dimensions.GEO NOT LIKE '%FRANCE-FM';       -- France entière (FRANCE-F), pas la seule métropole (FRANCE-FM)
