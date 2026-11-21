-- Les voies qui portent un nom de personne (table de correspondance écrite à la main, cas certains seulement).
-- sexe : « homme », « femme » ou « indetermine » (prénom absent ou ambigu).
-- Résultat : src/data/generated/rues_personnes.json
SELECT
  nom,
  sujet,
  sexe,
  categorie,
  description,
  adresses::INTEGER AS adresses
FROM rues_reference
WHERE nature = 'personne'
ORDER BY categorie = 'Non déterminé', categorie, sujet, nom;
