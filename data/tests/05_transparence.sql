-- Tests du thème « Transparence » : cohérence des balances, des comparaisons et du conseil municipal.
-- Zéro ligne = tout va bien.
-- Les 100 € sont bien répartis : chaque année, les postes font 100 % (à l'arrondi près).
SELECT 'transparence : les postes de ' || annee || ' font ' || round(sum(pour_100_euros), 1) || ' % au lieu de 100 %' AS probleme
FROM transparence_depenses
GROUP BY annee
HAVING abs(sum(pour_100_euros) - 100) > 0.5

-- Le total des dépenses payées est proche des charges de fonctionnement des comptes individuels (DGFiP) :
-- l'écart attendu est l'amortissement et les écritures de cessions, jamais plus de 15 %.
UNION ALL
SELECT 'transparence : dépenses ' || d.annee || ' (' || d.total_annee || ' €) éloignées des charges DGFiP (' || round(b.depenses_hab * b.population) || ' €)'
FROM (SELECT DISTINCT annee, total_annee FROM transparence_depenses) d
JOIN budget_annees b USING (annee)
WHERE d.total_annee > b.depenses_hab * b.population
   OR d.total_annee < 0.85 * b.depenses_hab * b.population

-- Indemnités : valeurs plausibles (euros par habitant) et série complète, sans année manquante.
UNION ALL
SELECT 'transparence : indemnités ' || annee || ' implausibles (' || indemnites_par_habitant || ' €/hab.)'
FROM transparence_elus
WHERE indemnites_par_habitant NOT BETWEEN 1 AND 200

UNION ALL
SELECT 'transparence : année manquante dans la série des indemnités'
WHERE (SELECT count(*) FROM transparence_elus) <> (SELECT max(annee) - min(annee) + 1 FROM transparence_elus)

UNION ALL
SELECT 'transparence : subventions ' || annee || ' implausibles (' || associations_par_habitant || ' €/hab.)'
FROM transparence_subventions
WHERE associations_par_habitant NOT BETWEEN 1 AND 300

-- Comparaisons : une ligne par indicateur, rang dans l'ensemble des communes comparées, moyenne de strate plausible.
UNION ALL
SELECT 'transparence : comparaison incomplète (' || count(*) || ' indicateurs au lieu de 3)'
FROM transparence_comparaison
HAVING count(*) <> 3

UNION ALL
SELECT 'transparence : rang hors limites pour ' || indicateur
FROM transparence_comparaison
WHERE rang NOT BETWEEN 1 AND nb_communes OR nb_communes < 20 OR nb_communes_strate < 100 OR strate_par_habitant NOT BETWEEN 0.5 AND 500

-- Marchés : jamais de date dans le futur ; les plafonds ne sont jamais additionnés (pas de colonne « total »).
UNION ALL
SELECT 'transparence : marché ' || id || ' notifié dans le futur'
FROM transparence_marches
WHERE date_notification > current_date

UNION ALL
SELECT 'transparence : appel d''offres ' || idweb || ' d''une année incohérente'
FROM transparence_appels_offres
WHERE annee NOT BETWEEN 2000 AND year(current_date)

-- Conseil : hommes + femmes = élus, tranches d'âge et professions couvrent tout le monde, un seul maire.
UNION ALL
SELECT 'transparence : femmes + hommes différent du nombre d''élus'
FROM transparence_conseil_resume
WHERE femmes + hommes <> nb_elus OR nb_elus NOT BETWEEN 9 AND 69

UNION ALL
SELECT 'transparence : les tranches d''âge ne couvrent pas tous les élus'
FROM transparence_conseil_resume
WHERE (SELECT sum(elus) FROM transparence_conseil_ages) <> nb_elus

UNION ALL
SELECT 'transparence : les parts d''âge des habitants ne font pas 100 %'
WHERE abs((SELECT sum(part_habitants) FROM transparence_conseil_ages) - 100) > 0.5

UNION ALL
SELECT 'transparence : les professions ne couvrent pas tous les élus'
FROM transparence_conseil_resume
WHERE (SELECT sum(elus) FROM transparence_conseil_csp) <> nb_elus

UNION ALL
SELECT 'transparence : maire absent ou en double (' || count(*) || ')'
FROM transparence_maire
HAVING count(*) <> 1

-- Aucun nom ni date de naissance ne doit se retrouver dans les fichiers du thème (sauf le maire).
UNION ALL
SELECT 'transparence : colonne nominative ou date de naissance dans le résumé du conseil'
FROM (DESCRIBE SELECT * FROM transparence_conseil_resume)
WHERE column_name ILIKE '%nom%' OR column_name ILIKE '%naissance%';
