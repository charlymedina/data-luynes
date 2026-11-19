-- Accidents de Luynes localisés, pour la carte : un point par accident.
-- Volontairement sans adresse, sans jour précis ni information sur les personnes (âge, sexe) :
-- seulement l'année, le mois, le moment de la journée, les conditions, la route et les modes impliqués.
-- Résultat : src/data/generated/accidents_carte.json
SELECT
  annee,
  mois,                                                      -- 1 = janvier … 12 = décembre
  moment,
  lumiere,
  meteo_libelle                                  AS meteo,
  route,
  gravite,
  -- modes impliqués, du plus vulnérable au plus lourd
  concat_ws(', ',
    CASE WHEN pieton THEN 'piéton' END,
    CASE WHEN velo THEN 'vélo' END,
    CASE WHEN trottinette THEN 'trottinette' END,
    CASE WHEN deux_roues THEN 'deux-roues motorisé' END,
    CASE WHEN voiture THEN 'voiture' END,
    CASE WHEN poids_lourd THEN 'poids lourd ou bus' END
  )                                              AS impliques,
  round(lat, 4)                                  AS lat,     -- ≈ 10 m de précision
  round(lon, 4)                                  AS lon
FROM accidents_complet
WHERE est_luynes AND lat IS NOT NULL
ORDER BY annee, mois;
