-- Tests du thème « Sport » : cohérence des licences (INJEP) et des équipements (RES). Zéro ligne = tout va bien.

-- Les totaux se recoupent : licences de la dernière année = somme des fédérations = dernière année de la série.
SELECT 'sport : licences ' || r.licences || ' ≠ somme des fédérations ' || f.total AS probleme
FROM sport_resume r, (SELECT sum(licences) AS total FROM sport_federations) f
WHERE r.licences <> f.total

UNION ALL
SELECT 'sport : licences du résumé ' || r.licences || ' ≠ dernière année de la série ' || a.licences
FROM sport_resume r, (SELECT licences FROM sport_annees ORDER BY annee DESC LIMIT 1) a
WHERE r.licences <> a.licences

-- Série sans année manquante, et assez longue pour une évolution.
UNION ALL
SELECT 'sport : série des licences incomplète (' || count(*) || ' années)'
FROM sport_annees
HAVING count(*) < 2 OR count(*) <> max(annee) - min(annee) + 1

-- Valeurs plausibles : licences pour 100 habitants, part de femmes, équipements pour 1 000 habitants.
UNION ALL
SELECT 'sport : licences pour 100 habitants implausibles (' || licences_pour_100 || ')'
FROM sport_resume WHERE licences_pour_100 NOT BETWEEN 5 AND 80

UNION ALL
SELECT 'sport : part de femmes implausible (' || femmes_pct || ' %)'
FROM sport_resume WHERE femmes_pct NOT BETWEEN 10 AND 90 OR femmes_pct_37 NOT BETWEEN 10 AND 90

UNION ALL
SELECT 'sport : équipements pour 1 000 habitants implausibles (' || equipements_pour_1000 || ')'
FROM sport_resume WHERE equipements_pour_1000 NOT BETWEEN 0.5 AND 50

-- Rangs entre 1 et le nombre de communes, sur l'ensemble des communes du département.
UNION ALL
SELECT 'sport : rang des licences hors limites (' || rang_licences || ' sur ' || nb_communes_licences || ')'
FROM sport_resume
WHERE rang_licences NOT BETWEEN 1 AND nb_communes_licences OR nb_communes_licences NOT BETWEEN 250 AND 300

UNION ALL
SELECT 'sport : rang des équipements hors limites (' || rang_equipements || ' sur ' || nb_communes_equipements || ')'
FROM sport_resume
WHERE rang_equipements NOT BETWEEN 1 AND nb_communes_equipements OR nb_communes_equipements NOT BETWEEN 250 AND 300

-- Pourcentages par tranche d'âge : chaque ensemble (Luynes, département) fait 100 %.
UNION ALL
SELECT 'sport : les tranches d''âge font ' || round(sum(part_luynes), 1) || ' % (Luynes) et ' || round(sum(part_37), 1) || ' % (département)'
FROM sport_ages
HAVING abs(sum(part_luynes) - 100) > 0.5 OR abs(sum(part_37) - 100) > 0.5

-- Les licences classées par âge ne dépassent pas le total (les âges inconnus sont écartés).
UNION ALL
SELECT 'sport : ' || a.total || ' licences par âge pour ' || r.licences || ' au total'
FROM (SELECT sum(licences) AS total FROM sport_ages) a, sport_resume r
WHERE a.total > r.licences OR a.total < 0.9 * r.licences

-- Équipements : la liste correspond au résumé, les positions sont bien à Luynes (et pas à Fondettes ou Tours).
UNION ALL
SELECT 'sport : ' || (SELECT count(*) FROM sport_equipements_liste) || ' équipements listés pour ' || equipements || ' annoncés'
FROM sport_resume
WHERE equipements <> (SELECT count(*) FROM sport_equipements_liste)

UNION ALL
SELECT 'sport : équipement hors de Luynes (' || nom || ', ' || lat || ', ' || lon || ')'
FROM sport_equipements_liste
WHERE lat IS NOT NULL AND (lat NOT BETWEEN 47.30 AND 47.46 OR lon NOT BETWEEN 0.40 AND 0.70)

UNION ALL
SELECT 'sport : plus d''équipements datés (' || sum(nombre) || ') que d''équipements (' || r.equipements || ')'
FROM sport_equipements_periodes, sport_resume r
GROUP BY r.equipements
HAVING sum(nombre) > r.equipements

UNION ALL
SELECT 'sport : année de mise en service implausible (' || nom || ', ' || annee_service || ')'
FROM sport_equipements_liste
WHERE annee_service NOT BETWEEN 1800 AND year(current_date)
-- (la fraîcheur des licences est vérifiée dans 04_fraicheur.sql)
