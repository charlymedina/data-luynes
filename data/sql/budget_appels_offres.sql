-- Appels d'offres publiés par la mairie au BOAMP (bulletin officiel des annonces de marchés publics), du plus récent au plus ancien.
-- Résultat : src/data/generated/budget_appels_offres.json
SELECT idweb, date_parution, year(date_parution)::INTEGER AS annee, objet, famille
FROM appels_offres
ORDER BY date_parution DESC, idweb;
