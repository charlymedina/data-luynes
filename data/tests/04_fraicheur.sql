-- Test de fraîcheur : la dernière année de chaque série n'est pas trop ancienne.
-- Si un producteur publie un nouveau millésime sous une autre adresse (nouveau jeu de données), le site
-- garderait sinon l'ancien sans rien dire : ce test le signale. « retard maximal » = délai normal de publication
-- + une marge. Zéro ligne = tout va bien.
WITH series AS (
  SELECT 'recensement (population)' AS serie, annee_derniere AS derniere, 5 AS retard_max FROM population_faits
  UNION ALL SELECT 'recensement (âges)', max(annee), 5 FROM population_ages
  UNION ALL SELECT 'état civil', max(annee), 2 FROM population_naissances_deces
  UNION ALL SELECT 'ventes DVF', annee_fin, 1 FROM immobilier_resume
  UNION ALL SELECT 'carte des loyers', max(annee), 2 FROM immobilier_loyers
  UNION ALL SELECT 'comptes de la commune', annee, 2 FROM budget_resume
  UNION ALL SELECT 'revenus (Filosofi)', annee_revenus, 4 FROM revenus_resume
  UNION ALL SELECT 'recensement (chômage)', annee_recensement, 5 FROM revenus_resume
  UNION ALL SELECT 'salaires', annee_salaires, 3 FROM revenus_resume
  UNION ALL SELECT 'accidents (BAAC)', annee_fin, 2 FROM accidents_resume
  UNION ALL SELECT 'équipements (BPE)', annee_bpe, 3 FROM equipements_resume
  UNION ALL SELECT 'effectifs scolaires', derniere_rentree, 1 FROM equipements_resume
  UNION ALL SELECT 'consommation d''énergie', annee_energie, 2 FROM energie_resume
  UNION ALL SELECT 'parc automobile', annee_parc, 1 FROM energie_resume
  UNION ALL SELECT 'délinquance', max(annee_fin), 2 FROM delinquance_indicateurs
  UNION ALL SELECT 'balances comptables', max(annee), 2 FROM transparence_elus
  UNION ALL SELECT 'licences sportives (INJEP)', annee_fin, 4 FROM sport_resume
  UNION ALL SELECT 'recensement (conseil municipal)', max(annee_recensement), 5 FROM transparence_conseil_resume
)
SELECT 'données trop anciennes : ' || serie || ' (dernière année ' || derniere || ', attendue au moins '
       || (year(current_date) - retard_max) || ') — vérifier si le producteur a publié un nouveau jeu' AS probleme
FROM series
WHERE derniere IS NULL OR derniere < year(current_date) - retard_max;
