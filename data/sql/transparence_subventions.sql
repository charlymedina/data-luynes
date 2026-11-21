-- Subventions de fonctionnement, par année (2010 → dernière année) :
--  - aux associations : compte 6574 (M14) puis 65748 (M57) ;
--  - au CCAS (centre communal d'action sociale) : compte 657362 (M14) puis 657363 (M57).
-- Une année sans écriture sur le compte du CCAS vaut 0 (aucun versement enregistré cette année-là).
-- Résultat : src/data/generated/transparence_subventions.json
SELECT
  p.annee,
  round(coalesce(sum(depense_nette) FILTER (compte IN ('6574', '65748')), 0))::INTEGER                      AS associations,
  round(coalesce(sum(depense_nette) FILTER (compte IN ('657362', '657363')), 0))::INTEGER                   AS ccas,
  round(coalesce(sum(depense_nette) FILTER (compte IN ('6574', '65748')), 0) / p.population, 1)::DOUBLE    AS associations_par_habitant,
  round(coalesce(sum(depense_nette) FILTER (compte IN ('657362', '657363')), 0) / p.population, 1)::DOUBLE AS ccas_par_habitant,
  p.population
FROM population_dgfip p
LEFT JOIN balance_luynes b ON b.annee = p.annee AND b.compte IN ('6574', '65748', '657362', '657363')
WHERE p.annee >= (SELECT min(annee) FROM balance_luynes) AND p.annee <= (SELECT max(annee) FROM balance_luynes)
GROUP BY p.annee, p.population
ORDER BY p.annee;
