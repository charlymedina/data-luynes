-- Test : les pourcentages affichés sont compris entre 0 et 100, et les taux sont positifs.
-- Zéro ligne = tout va bien.
WITH valeurs AS (
  SELECT 'âges ' || territoire || ' : 65 ans et plus' AS nom, part_65_plus AS v FROM population_ages
  UNION ALL SELECT 'âges ' || territoire || ' : moins de 20 ans', part_moins_20 FROM population_ages
  UNION ALL SELECT 'pauvreté', pauvrete FROM revenus_resume
  UNION ALL SELECT 'chômage', chomage FROM revenus_resume
  UNION ALL SELECT 'travail hors de la commune', part_travail_ailleurs FROM revenus_resume
  UNION ALL SELECT 'voitures électriques', part_electrique_pct FROM energie_resume
  UNION ALL SELECT 'voitures diesel', part_diesel_pct FROM energie_resume
  UNION ALL SELECT 'logements au gaz', part_logements_gaz_pct FROM energie_resume
  UNION ALL SELECT 'taxe foncière', taux_foncier FROM budget_resume
  UNION ALL SELECT 'zone inondable', part_commune_pct FROM risques_zones_inondables
  UNION ALL SELECT 'participation ' || id_election, participation_luynes FROM elections_participation
  UNION ALL SELECT 'participation France ' || id_election, participation_france FROM elections_participation WHERE participation_france IS NOT NULL
  UNION ALL SELECT 'DPE ' || etiquette, part_luynes FROM immobilier_dpe
)
SELECT 'pourcentage impossible : ' || nom || ' = ' || coalesce(v::VARCHAR, 'vide') AS probleme
FROM valeurs
WHERE v IS NULL OR v < 0 OR v > 100

UNION ALL
SELECT 'taux de délinquance négatif : ' || libelle
FROM delinquance_indicateurs
WHERE taux_luynes < 0 OR taux_37 < 0 OR taux_france < 0

UNION ALL
SELECT 'répartition des étiquettes DPE : le total ne fait pas 100 %'
FROM (SELECT sum(part_luynes) AS total FROM immobilier_dpe)
WHERE abs(total - 100) > 0.5;
