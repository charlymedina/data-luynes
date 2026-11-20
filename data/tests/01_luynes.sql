-- Test : les fichiers de Luynes parlent bien de Luynes, avec des valeurs plausibles.
-- Chaque test renvoie les lignes EN ANOMALIE (colonne « probleme ») : zéro ligne = tout va bien.
-- Chaque fichier src/data/generated/<nom>.json est lisible ici comme une table <nom>.
SELECT 'commune : code INSEE ou population incorrects' AS probleme
FROM commune
WHERE code_insee <> '37139' OR population NOT BETWEEN 1000 AND 50000

UNION ALL
SELECT 'population : la dernière population du recensement diffère de celle de l''API Géo'
FROM population_faits, commune
WHERE population_faits.population_derniere <> commune.population

UNION ALL
SELECT 'territoire : Luynes absente de la liste des communes du département'
WHERE (SELECT count(*) FROM territoire_communes WHERE est_luynes) <> 1

UNION ALL
SELECT 'immobilier : plus de ventes localisées que de ventes'
FROM immobilier_resume
WHERE ventes_geolocalisees > ventes

UNION ALL
SELECT 'immobilier : la carte ne contient pas toutes les ventes localisées'
FROM immobilier_resume
WHERE ventes_geolocalisees <> (SELECT count(*) FROM immobilier_ventes)

UNION ALL
SELECT 'patrimoine : plus d''arrêtés que de reconnaissances de catastrophe naturelle'
FROM patrimoine_risques_resume
WHERE catnat_arretes > catnat OR catnat_arretes < 1

UNION ALL
SELECT 'élections : plus de scrutins « au-dessus de la France » que de scrutins comparés'
FROM elections_resume
WHERE fois_au_dessus_france > nb_premiers_tours

UNION ALL
SELECT 'équipements : la somme des domaines ne fait pas le total'
FROM equipements_resume
WHERE equipements <> (SELECT sum(nombre) FROM equipements_domaines WHERE domaine <> '_T')

UNION ALL

SELECT 'eau : aucun prélèvement ou valeurs impossibles'
FROM eau_resume
WHERE prelevements < 10 OR nitrates_luynes < 0 OR durete_luynes NOT BETWEEN 0 AND 80

UNION ALL

SELECT 'construction : pas de logements ou de logements sociaux'
FROM construction_resume
WHERE commences_total <= 0 OR logements_sociaux <= 0 OR annee_debut > annee_fin
