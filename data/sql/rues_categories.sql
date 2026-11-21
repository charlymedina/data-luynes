-- Les voies de personnes regroupées par catégorie (écrivains, hommes d'État…) ; « Non déterminé » en dernier.
-- Résultat : src/data/generated/rues_categories.json
SELECT
  categorie,
  count(*)::INTEGER                       AS voies,
  count(DISTINCT sujet)::INTEGER          AS personnes,
  count(*) FILTER (sexe = 'femme')::INTEGER AS femmes,
  sum(adresses)::INTEGER                  AS adresses
FROM rues_reference
WHERE nature = 'personne'
GROUP BY categorie
ORDER BY categorie = 'Non déterminé', voies DESC, categorie;
