-- Professions des élus, regroupées en grandes catégories socioprofessionnelles de l'INSEE (premier chiffre du code).
-- Les « anciens » (anciens cadres, anciens employés…) sont classés par l'INSEE avec les retraités.
-- Résultat : src/data/generated/transparence_conseil_csp.json (une ligne par catégorie présente, de la plus fréquente à la moins fréquente)
SELECT
  CASE groupe_csp
    WHEN 1 THEN 'Agriculteurs exploitants'
    WHEN 2 THEN 'Artisans, commerçants, chefs d''entreprise'
    WHEN 3 THEN 'Cadres et professions intellectuelles supérieures'
    WHEN 4 THEN 'Professions intermédiaires'
    WHEN 5 THEN 'Employés'
    WHEN 6 THEN 'Ouvriers'
    WHEN 7 THEN 'Retraités'
    ELSE 'Autres'
  END                                               AS categorie,
  groupe_csp,
  count(*)::INTEGER                                 AS elus,
  round(100.0 * count(*) / sum(count(*)) OVER (), 1)::DOUBLE AS part
FROM conseil
GROUP BY groupe_csp
ORDER BY elus DESC, groupe_csp;
