-- Des noms de voies et de lieux-dits qui intriguent (choix éditorial, écrit dans data/reference/noms-de-rues.csv).
-- Résultat : src/data/generated/rues_curiosites.json
SELECT
  sujet AS nom,
  type_voie AS type,
  adresses::INTEGER AS adresses
FROM rues_reference
WHERE nature = 'curiosite'
ORDER BY sujet;
