-- Véhicules impliqués dans les accidents d'Indre-et-Loire d'une année (BAAC), pour l'archive.
--   categorie_vehicule (catv) : 1 vélo, 2 cyclomoteur, 7 voiture, 10 utilitaire, 13-17 poids lourds, 30-34 motos,
--   37-40 bus, car, tramway, train, 50/60 trottinettes et engins de déplacement personnel, 80 vélo électrique…
SELECT
  Num_Acc                    AS num_acc,
  trim(num_veh)              AS num_veh,
  try_cast(catv AS INTEGER)  AS categorie_vehicule
FROM read_csv('{fichier}', delim = '{sep}', all_varchar = true, header = true)
WHERE Num_Acc IN (SELECT num_acc FROM accidents_annee);
