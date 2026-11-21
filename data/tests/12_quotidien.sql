-- Tests du thème « Vie quotidienne » : parts entre 0 et 100, rangs cohérents, séries complètes. Zéro ligne = tout va bien.

-- Fibre : raccordables ≤ locaux, parts plausibles, rang dans l'ensemble des communes, dernière publication récente.
SELECT 'quotidien : fibre incohérente (' || fibre || ' raccordables pour ' || locaux || ' locaux)' AS probleme
FROM quotidien_fibre_resume WHERE fibre > locaux OR fibre_pct NOT BETWEEN 1 AND 100 OR sans_fibre <> locaux - fibre

UNION ALL
SELECT 'quotidien : rang fibre ' || rang || ' hors de 1..' || nb_communes
FROM quotidien_fibre_resume WHERE rang NOT BETWEEN 1 AND nb_communes OR nb_communes NOT BETWEEN 250 AND 300

UNION ALL
SELECT 'quotidien : fibre du département implausible (' || fibre_pct_37 || ' %)'
FROM quotidien_fibre_resume WHERE fibre_pct_37 NOT BETWEEN 30 AND 100

UNION ALL
SELECT 'quotidien : la série de la fibre a moins de 4 dates ou une part hors de 0..100'
FROM quotidien_fibre_trimestres HAVING count(*) < 4 OR min(luynes_pct) < 0 OR max(luynes_pct) > 100 OR max(departement_pct) > 100

UNION ALL
SELECT 'quotidien : la dernière publication de la fibre date du ' || date_fin || ' (plus de 15 mois)'
FROM quotidien_fibre_resume WHERE date_fin::DATE < current_date - INTERVAL 15 MONTH

-- Défibrillateurs : un nombre plausible, des sous-ensembles qui ne dépassent pas le total, un rang cohérent.
UNION ALL
SELECT 'quotidien : défibrillateurs implausibles (' || defibrillateurs || ' à Luynes, ' || total_37 || ' dans le département)'
FROM quotidien_dae_resume WHERE defibrillateurs NOT BETWEEN 1 AND 100 OR total_37 < 500

UNION ALL
SELECT 'quotidien : sous-ensemble de défibrillateurs plus grand que le total'
FROM quotidien_dae_resume
WHERE exterieurs > defibrillateurs OR permanents > defibrillateurs OR exterieurs_permanents > least(exterieurs, permanents)

UNION ALL
SELECT 'quotidien : rang des défibrillateurs hors de 1..' || nb_communes
FROM quotidien_dae_resume WHERE rang NOT BETWEEN 1 AND nb_communes

UNION ALL
SELECT 'quotidien : carte sans défibrillateurs ou nombre différent du résumé'
FROM quotidien_dae_resume
WHERE defibrillateurs <> (SELECT count(*) FROM quotidien_carte WHERE couche = 'defibrillateurs')

-- Covoiturage : 4 années, valeurs positives, toutes les communes présentes (le fichier contient aussi les 0).
UNION ALL
SELECT 'quotidien : covoiturage ' || annee || ' implausible (' || trajets || ' trajets à Luynes, ' || trajets_37 || ' dans le département)'
FROM quotidien_covoiturage WHERE trajets < 0 OR trajets > trajets_37 OR trajets_37 < 1000

UNION ALL
SELECT 'quotidien : covoiturage : ' || count(*) || ' années (au moins 3 attendues)'
FROM quotidien_covoiturage HAVING count(*) < 3

UNION ALL
SELECT 'quotidien : covoiturage ' || annee || ' : seulement ' || communes_37_avec_trajets || ' communes dans le fichier (272 attendues)'
FROM quotidien_covoiturage WHERE communes_37_avec_trajets < 250

-- Mobilier : points de verre cohérents avec la carte, rang dans la métropole, habitants par point plausible.
UNION ALL
SELECT 'quotidien : points de verre incohérents entre résumé et carte'
FROM quotidien_mobilier WHERE verre <> (SELECT count(*) FROM quotidien_carte WHERE couche = 'verre')

UNION ALL
SELECT 'quotidien : verre : rang ' || verre_rang || ' hors de 1..' || verre_nb_communes || ' ou habitants par point implausible'
FROM quotidien_mobilier
WHERE verre_rang NOT BETWEEN 1 AND verre_nb_communes OR verre_habitants_par_point NOT BETWEEN 20 AND 5000 OR verre_points_metropole < verre

UNION ALL
SELECT 'quotidien : bancs ou textile négatifs, ou bancs différents de la carte'
FROM quotidien_mobilier WHERE bancs < 0 OR textile < 0 OR bancs <> (SELECT count(*) FROM quotidien_carte WHERE couche = 'bancs')

-- Carte : coordonnées dans la zone de Luynes (latitude 47,3–47,5 ; longitude 0,4–0,7).
UNION ALL
SELECT 'quotidien : point hors de Luynes (' || couche || ', ' || libelle || ')'
FROM quotidien_carte WHERE lat NOT BETWEEN 47.3 AND 47.5 OR lon NOT BETWEEN 0.4 AND 0.7;
