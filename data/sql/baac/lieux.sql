-- Lieu des accidents d'Indre-et-Loire d'une année (BAAC), pour l'archive : type de route et numéro de voie.
--   categorie_route (catr) : 1 autoroute, 2 route nationale, 3 route départementale, 4 voie communale,
--   5 hors réseau public, 6 parking, 7 routes de métropole urbaine, 9 autre
SELECT
  Num_Acc                    AS num_acc,
  try_cast(catr AS INTEGER)  AS categorie_route,
  -- numéro de la route : « 952 », « D952 », « 952.0 »… → « 952 » (vide si inconnu)
  nullif(regexp_replace(regexp_replace(upper(coalesce(voie, '')), '^[A-Z ]+', ''), '\.0+$|[^0-9A-Z]', '', 'g'), '') AS numero_route
FROM read_csv('{fichier}', delim = '{sep}', all_varchar = true, header = true)
WHERE Num_Acc IN (SELECT num_acc FROM accidents_annee);
