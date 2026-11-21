-- Indemnités des élus, par année (2010 → dernière année) : montant, euros par habitant.
--  - indemnités : compte 6531 (M14) puis 65311 (M57) ;
--  - frais et cotisations : tous les autres comptes 653… (frais de mission, cotisations de retraite et de sécurité
--    sociale, formation) ; 65312 à 65315 depuis 2024.
-- Résultat : src/data/generated/transparence_elus.json
SELECT
  b.annee,
  round(sum(depense_nette) FILTER (compte IN ('6531', '65311')))::INTEGER                       AS indemnites,
  round(sum(depense_nette) FILTER (compte LIKE '653%' AND compte NOT IN ('6531', '65311')))::INTEGER AS frais_cotisations,
  round(sum(depense_nette))::INTEGER                                                              AS total,
  round(sum(depense_nette) FILTER (compte IN ('6531', '65311')) / any_value(p.population), 1)::DOUBLE AS indemnites_par_habitant,
  round(sum(depense_nette) / any_value(p.population), 1)::DOUBLE                                 AS total_par_habitant,
  any_value(p.population)                                                                        AS population
FROM balance_luynes b
JOIN population_dgfip p USING (annee)
WHERE compte LIKE '653%'
GROUP BY b.annee
ORDER BY b.annee;
