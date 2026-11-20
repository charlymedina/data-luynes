-- Logements autorisés et commencés à Luynes chaque année (Sitadel), dont logements collectifs (appartements).
-- La colonne « complete » vaut false pour l'année en cours (moins de 12 mois publiés).
-- Résultat : src/data/generated/construction_annees.json
SELECT
  s.annee,
  sum(s.autorises) FILTER (s.type_logement = 'Tous Logements')::INTEGER AS autorises,
  sum(s.commences) FILTER (s.type_logement = 'Tous Logements')::INTEGER AS commences,
  sum(s.commences) FILTER (s.type_logement = 'Collectif')::INTEGER      AS commences_collectifs,
  (s.annee IN (SELECT annee FROM sitadel_annees_completes))              AS complete
FROM sitadel s
GROUP BY s.annee
ORDER BY s.annee;
