-- Lieu des accidents d'Indre-et-Loire d'une année (BAAC), pour l'archive (vue « brut » : voir caract.sql).
--   categorie_route (catr) : 1 autoroute, 2 route nationale, 3 route départementale, 4 voie communale,
--   5 hors réseau public, 6 parking, 7 routes de métropole urbaine, 9 autre
--   surface (surf) : 1 normale, 2 mouillée, 3 flaques, 4 inondée, 5 enneigée, 6 boue, 7 verglacée, 8 corps gras, 9 autre
--   vitesse_max (vma) : vitesse maximale autorisée en km/h — publiée seulement depuis 2019
SELECT
  Num_Acc                    AS num_acc,
  try_cast(catr AS INTEGER)  AS categorie_route,
  -- numéro de la route : « 952 », « D952 », « 952.0 »… → « 952 » (vide si inconnu)
  nullif(regexp_replace(regexp_replace(upper(coalesce(voie, '')), '^[A-Z ]+', ''), '\.0+$|[^0-9A-Z]', '', 'g'), '') AS numero_route,
  try_cast(surf AS INTEGER)  AS surface,
  -- vitesses aberrantes (0, 1, 999…) mises à NULL
  CASE WHEN try_cast(vma AS INTEGER) BETWEEN 10 AND 130 THEN try_cast(vma AS INTEGER) END AS vitesse_max
FROM brut
WHERE Num_Acc IN (SELECT num_acc FROM accidents_annee);
