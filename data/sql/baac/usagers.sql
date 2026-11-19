-- Usagers impliqués dans les accidents d'Indre-et-Loire d'une année (BAAC), pour l'archive.
-- Volontairement réduit : catégorie d'usager et gravité seulement (ni âge, ni sexe, ni place dans le véhicule).
--   categorie_usager : 1 conducteur, 2 passager, 3 piéton
--   gravite          : 1 indemne, 2 tué, 3 blessé hospitalisé, 4 blessé léger
SELECT
  Num_Acc                    AS num_acc,
  trim(num_veh)              AS num_veh,
  try_cast(catu AS INTEGER)  AS categorie_usager,
  try_cast(grav AS INTEGER)  AS gravite
FROM read_csv('{fichier}', delim = '{sep}', all_varchar = true, header = true)
WHERE Num_Acc IN (SELECT num_acc FROM accidents_annee);
