-- L'eau du robinet à Luynes, année par année : nombre de prélèvements, prélèvements non conformes aux limites
-- sanitaires (bactéries, physico-chimie) et teneur moyenne / maximale en nitrates.
-- Résultat : src/data/generated/eau_annees.json
SELECT
  p.annee,
  count(*)::INTEGER                                              AS prelevements,
  count(*) FILTER (p.bact = 'N')::INTEGER                        AS non_conformes_bact,
  count(*) FILTER (p.physico_chimie = 'N')::INTEGER              AS non_conformes_pc,
  round(avg(n.resultat_numerique), 1)::DOUBLE                    AS nitrates_moyenne,  -- mg/L (limite : 50)
  round(max(n.resultat_numerique), 1)::DOUBLE                    AS nitrates_max
FROM eau_prelevements p
LEFT JOIN (SELECT code_prelevement, resultat_numerique FROM eau_analyses WHERE code_parametre = '1340') n USING (code_prelevement)
GROUP BY p.annee
ORDER BY p.annee;
