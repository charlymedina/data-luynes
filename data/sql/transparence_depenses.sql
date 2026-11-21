-- « Où vont 100 € » : dépenses de fonctionnement de Luynes par poste, une ligne par année et par poste (2010 → dernière année).
-- Montant en euros, part sur 100 € et euros par habitant (population retenue par la DGFiP).
-- Résultat : src/data/generated/transparence_depenses.json
WITH total AS (
  SELECT annee, sum(montant) AS total FROM depenses_par_poste GROUP BY annee
)
SELECT
  d.annee,
  d.poste,
  round(d.montant)::INTEGER                         AS montant,
  round(100 * d.montant / t.total, 2)::DOUBLE      AS pour_100_euros,
  round(d.montant / p.population, 1)::DOUBLE       AS euros_par_habitant,
  round(t.total)::INTEGER                           AS total_annee,
  p.population
FROM depenses_par_poste d
JOIN total t USING (annee)
JOIN population_dgfip p USING (annee)
ORDER BY d.annee, d.montant DESC;
