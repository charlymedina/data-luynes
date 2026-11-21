-- Vue partagée : comptages GBIF dans le contour de Luynes, une ligne par valeur d'un champ.
-- Le fichier GBIF contient « facets » = une liste de champs (année, groupe…), chacun avec ses valeurs et leur nombre d'observations.
-- ⚠ Ces comptages sont des OBSERVATIONS (une personne qui voit un merle deux jours de suite = 2), pas des individus.
CREATE OR REPLACE MACRO nature_gbif_facette(fichier, champ) AS TABLE
  SELECT c.name AS valeur, c.count::INTEGER AS observations
  FROM (SELECT unnest(facets) AS f FROM read_json(fichier)), unnest(f.counts) AS t(c)
  WHERE f.field = champ;
