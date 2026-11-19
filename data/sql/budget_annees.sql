-- Les comptes de Luynes année par année, en euros par habitant, comparés à la moyenne de la strate
-- (communes de même taille : 3 500 à 5 000 habitants jusqu'en 2005, puis 5 000 à 10 000).
-- Résultat : src/data/generated/budget_annees.json (une ligne par année).
SELECT
  an::INTEGER                 AS annee,
  pop1::INTEGER               AS population,
  round(fcharge)::INTEGER     AS depenses_hab,          -- dépenses de fonctionnement par habitant
  round(mcharge)::INTEGER     AS depenses_hab_strate,
  round(fprod)::INTEGER       AS recettes_hab,          -- recettes de fonctionnement par habitant
  round(mprod)::INTEGER       AS recettes_hab_strate,
  round(fequip)::INTEGER      AS equipement_hab,        -- dépenses d'équipement (travaux, achats durables)
  round(mequip)::INTEGER      AS equipement_hab_strate,
  round(fdette)::INTEGER      AS dette_hab,             -- dette restant due au 31 décembre
  round(mdette)::INTEGER      AS dette_hab_strate,
  round(fcaf)::INTEGER        AS caf_hab,               -- capacité d'autofinancement brute
  round(mcaf)::INTEGER        AS caf_hab_strate,
  round(tfb, 2)::DOUBLE       AS taux_foncier,          -- taux de taxe foncière sur le bâti (%)
  round(tmfb, 2)::DOUBLE      AS taux_foncier_strate
FROM budget_luynes
ORDER BY an;
