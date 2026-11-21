-- Tests du thème « Nature & paysages » : surfaces cohérentes, sources complètes. Zéro ligne = tout va bien.

-- Une zone ne peut pas dépasser la commune, et les zones réunies sont entre la plus grande et la somme des parts.
SELECT 'nature : une zone dépasse la surface de la commune (' || nom || ')' AS probleme
FROM nature_zonages, nature_resume WHERE surface_ha > surface_commune_ha

UNION ALL
SELECT 'nature : surface en zonage incohérente (' || zonee_pct || ' %)'
FROM nature_resume
WHERE zonee_pct < (SELECT max(part_commune_pct) FROM nature_zonages) - 0.2
   OR zonee_pct > (SELECT sum(part_commune_pct) FROM nature_zonages) + 0.2

UNION ALL
SELECT 'nature : nombre de zones incohérent entre résumé et liste'
FROM nature_resume WHERE nb_znieff + nb_natura <> (SELECT count(*) FROM nature_zonages)

-- Cultures : la somme des familles retombe sur la surface agricole, les prairies et les vignes en font partie.
UNION ALL
SELECT 'nature : somme des cultures ' || round((SELECT sum(surface_ha) FROM nature_cultures)) || ' ha ≠ surface agricole ' || agricole_ha || ' ha'
FROM nature_resume WHERE abs((SELECT sum(surface_ha) FROM nature_cultures) - agricole_ha) > 2

UNION ALL
SELECT 'nature : surface agricole implausible (' || agricole_pct || ' % de la commune)'
FROM nature_resume WHERE agricole_pct NOT BETWEEN 5 AND 80

UNION ALL
SELECT 'nature : prairies ou vignes plus grandes que la surface agricole'
FROM nature_resume WHERE prairies_ha > agricole_ha OR vignes_ha > agricole_ha

UNION ALL
SELECT 'nature : l''année de comparaison du RPG n''est pas antérieure'
FROM nature_resume WHERE annee_rpg_ancienne >= annee_rpg

UNION ALL
SELECT 'nature : vignobles AOC plus grands que la commune ou appellations incohérentes'
FROM nature_resume WHERE aoc_ha > surface_commune_ha OR aoc_nb_appellations <> (SELECT count(*) FROM nature_aoc)

-- Carte : une forme par couche attendue.
UNION ALL
SELECT 'nature : ' || count(*) || ' couches sur la carte (4 attendues)'
FROM nature_cartes HAVING count(*) <> 4

-- Biodiversité : plus d'observations que d'espèces, liste non tronquée (la requête GBIF demande au plus 20 000 espèces),
-- groupes qui recoupent presque toutes les observations.
UNION ALL
SELECT 'nature : espèces implausibles (' || especes || ' espèces pour ' || observations || ' observations)'
FROM nature_biodiversite_resume WHERE especes > observations OR especes NOT BETWEEN 50 AND 19000

UNION ALL
SELECT 'nature : les groupes ne couvrent que ' || (SELECT sum(observations) FROM nature_biodiversite_groupes) || ' observations sur ' || observations
FROM nature_biodiversite_resume WHERE (SELECT sum(observations) FROM nature_biodiversite_groupes) < 0.9 * observations
   OR (SELECT sum(observations) FROM nature_biodiversite_groupes) > observations

UNION ALL
SELECT 'nature : classement des espèces observées non trié'
FROM (SELECT observations, lag(observations) OVER (ORDER BY observations DESC) AS precedent FROM nature_biodiversite_top)
WHERE precedent < observations;
