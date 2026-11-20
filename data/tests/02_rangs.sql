-- Test : chaque rang est compris entre 1 et le nombre de communes classées, et ce nombre est plausible
-- (l'Indre-et-Loire compte environ 270 communes ; moins pour les classements restreints).
-- Zéro ligne = tout va bien.
WITH rangs AS (
  SELECT 'population' AS indicateur, rang_population AS rang, nb_communes AS total FROM rang_departement
  UNION ALL SELECT 'superficie', rang_surface, nb_communes FROM rang_departement
  UNION ALL SELECT 'densité', rang_densite, nb_communes FROM rang_departement
  UNION ALL SELECT 'croissance', rang_evolution, nb_communes FROM rang_departement
  UNION ALL SELECT '65 ans et plus', rang_65_plus, nb_communes FROM rang_departement
  UNION ALL SELECT 'monuments', rang_monuments, nb_communes FROM patrimoine_risques_resume
  UNION ALL SELECT 'cavités', rang_cavites, nb_communes FROM patrimoine_risques_resume
  UNION ALL SELECT 'catastrophes naturelles', rang_catnat, nb_communes FROM patrimoine_risques_resume
  UNION ALL SELECT 'prix au m²', rang_prix_m2_maison, nb_communes_classees FROM immobilier_resume
  UNION ALL SELECT 'loyer ' || type_logement, rang, nb_communes FROM immobilier_loyers
  UNION ALL SELECT 'charges de fonctionnement', rang_depenses, nb_communes FROM budget_resume
  UNION ALL SELECT 'dette', rang_dette, nb_communes FROM budget_resume
  UNION ALL SELECT 'taxe foncière', rang_taux_foncier, nb_communes FROM budget_resume
  UNION ALL SELECT 'équipement', rang_equipement, nb_communes FROM budget_resume
  UNION ALL SELECT 'niveau de vie', rang_niveau_vie, nb_communes_niveau_vie FROM revenus_resume
  UNION ALL SELECT 'chômage', rang_chomage, nb_communes_chomage FROM revenus_resume
  UNION ALL SELECT 'accidents', rang_taux, nb_communes FROM accidents_resume
  UNION ALL SELECT 'équipements', rang_equipements, nb_communes FROM equipements_resume
  UNION ALL SELECT 'électricité', rang_elec, nb_communes_elec FROM energie_resume
  UNION ALL SELECT 'solaire', rang_solaire, nb_communes FROM energie_resume
  UNION ALL SELECT 'voitures électriques', rang_electrique, nb_communes_parc FROM energie_resume
  UNION ALL SELECT 'participation ' || type, rang, nb_communes FROM elections_derniers
)
SELECT 'rang hors limites : ' || indicateur || ' (' || rang || ' sur ' || total || ')' AS probleme
FROM rangs
WHERE rang IS NULL OR total IS NULL OR rang < 1 OR rang > total OR total > 280 OR total < 100;
