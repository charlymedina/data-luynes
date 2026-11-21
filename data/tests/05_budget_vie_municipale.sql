-- Tests de la partie « vie municipale » de la page Budget : cohérence des balances, des comparaisons, des marchés et du conseil municipal.
-- Zéro ligne = tout va bien.
-- Une seule population de référence : celle des balances (€ par habitant) est la même que celle des comptes individuels.
SELECT 'vie municipale : population ' || e.annee || ' différente entre balances (' || e.population || ') et comptes individuels (' || b.population || ')' AS probleme
FROM budget_elus e
JOIN budget_annees b USING (annee)
WHERE e.population <> b.population

-- Indemnités : valeurs plausibles (euros par habitant) et série complète, sans année manquante.
UNION ALL
SELECT 'vie municipale : indemnités ' || annee || ' implausibles (' || indemnites_par_habitant || ' €/hab.)'
FROM budget_elus
WHERE indemnites_par_habitant NOT BETWEEN 1 AND 200

UNION ALL
SELECT 'vie municipale : année manquante dans la série des indemnités'
WHERE (SELECT count(*) FROM budget_elus) <> (SELECT max(annee) - min(annee) + 1 FROM budget_elus)

UNION ALL
SELECT 'vie municipale : subventions ' || annee || ' implausibles (' || associations_par_habitant || ' €/hab.)'
FROM budget_subventions
WHERE associations_par_habitant NOT BETWEEN 1 AND 300

-- Comparaisons : une ligne par indicateur, rang dans l'ensemble des communes comparées, moyenne de strate plausible.
UNION ALL
SELECT 'vie municipale : comparaison incomplète (' || count(*) || ' indicateurs au lieu de 3)'
FROM budget_comparaison
HAVING count(*) <> 3

UNION ALL
SELECT 'vie municipale : rang hors limites pour ' || indicateur
FROM budget_comparaison
WHERE rang NOT BETWEEN 1 AND nb_communes OR nb_communes < 20 OR nb_communes_strate < 100 OR strate_par_habitant NOT BETWEEN 0.5 AND 500

-- Marchés : jamais de date dans le futur ; les plafonds ne sont jamais additionnés (pas de colonne « total »).
UNION ALL
SELECT 'vie municipale : marché ' || id || ' notifié dans le futur'
FROM budget_marches
WHERE date_notification > current_date

UNION ALL
SELECT 'vie municipale : appel d''offres ' || idweb || ' d''une année incohérente'
FROM budget_appels_offres
WHERE annee NOT BETWEEN 2000 AND year(current_date)

-- Conseil : hommes + femmes = élus, tranches d'âge et professions couvrent tout le monde, un seul maire.
UNION ALL
SELECT 'vie municipale : femmes + hommes différent du nombre d''élus'
FROM budget_conseil_resume
WHERE femmes + hommes <> nb_elus OR nb_elus NOT BETWEEN 9 AND 69

UNION ALL
SELECT 'vie municipale : les tranches d''âge ne couvrent pas tous les élus'
FROM budget_conseil_resume
WHERE (SELECT sum(elus) FROM budget_conseil_ages) <> nb_elus

UNION ALL
SELECT 'vie municipale : les parts d''âge des habitants ne font pas 100 %'
WHERE abs((SELECT sum(part_habitants) FROM budget_conseil_ages) - 100) > 0.5

UNION ALL
SELECT 'vie municipale : les professions ne couvrent pas tous les élus'
FROM budget_conseil_resume
WHERE (SELECT sum(elus) FROM budget_conseil_csp) <> nb_elus

UNION ALL
SELECT 'vie municipale : maire absent ou en double (' || count(*) || ')'
FROM budget_maire
HAVING count(*) <> 1

-- Aucun nom ni date de naissance ne doit se retrouver dans les fichiers du thème (sauf le maire).
UNION ALL
SELECT 'vie municipale : colonne nominative ou date de naissance dans le résumé du conseil'
FROM (DESCRIBE SELECT * FROM budget_conseil_resume)
WHERE column_name ILIKE '%nom%' OR column_name ILIKE '%naissance%';
