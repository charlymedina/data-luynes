-- Usagers impliqués dans les accidents d'Indre-et-Loire d'une année (BAAC), pour l'archive (vue « brut » : voir caract.sql).
-- Données publiées par l'ONISR : catégorie, gravité, sexe, année de naissance et équipement de sécurité.
--   categorie_usager : 1 conducteur, 2 passager, 3 piéton
--   gravite          : 1 indemne, 2 tué, 3 blessé hospitalisé, 4 blessé léger
--   sexe             : 1 masculin, 2 féminin
--   equipement       : 0 aucun, 1 ceinture, 2 casque, 3 dispositif enfant, 4 gilet réfléchissant, 5 airbag (2 roues),
--                      6 gants, 9 autre (NULL = non renseigné ou non déterminable)
--   Avant 2019, « secu » tenait sur 2 chiffres : l'équipement (1er) et s'il était porté (2e : 1 oui, 2 non) ;
--   depuis 2019, « secu1 » est l'équipement porté (jusqu'à 3 colonnes ; on garde le premier).
SELECT
  Num_Acc                    AS num_acc,
  trim(num_veh)              AS num_veh,
  try_cast(catu AS INTEGER)  AS categorie_usager,
  try_cast(grav AS INTEGER)  AS gravite,
  try_cast(sexe AS INTEGER)  AS sexe,
  CASE WHEN try_cast(an_nais AS INTEGER) BETWEEN 1900 AND {annee} THEN try_cast(an_nais AS INTEGER) END AS annee_naissance,
  CASE
    WHEN secu1 IS NOT NULL THEN CASE WHEN try_cast(secu1 AS INTEGER) IN (0, 1, 2, 3, 4, 5, 6, 9) THEN try_cast(secu1 AS INTEGER) END
    WHEN length(trim(secu)) = 2 AND right(trim(secu), 1) = '1' THEN try_cast(left(trim(secu), 1) AS INTEGER)
    WHEN length(trim(secu)) = 2 AND right(trim(secu), 1) = '2' THEN 0
  END                        AS equipement
FROM brut
WHERE Num_Acc IN (SELECT num_acc FROM accidents_annee);
