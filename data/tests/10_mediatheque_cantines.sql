-- Tests de la médiathèque (SLL) et des cantines (Ma Cantine) : plausibilité et cohérence. Zéro ligne = tout va bien.
SELECT 'médiathèque : année de l''enquête illisible' AS probleme FROM equipements_mediatheque WHERE annee IS NULL OR annee NOT BETWEEN 2015 AND 2100

UNION ALL
SELECT 'médiathèque : prêts par habitant implausibles (' || prets_par_habitant || ')'
FROM equipements_mediatheque WHERE prets_par_habitant IS NOT NULL AND prets_par_habitant NOT BETWEEN 0.1 AND 40

UNION ALL
SELECT 'médiathèque : emprunteurs > population' FROM equipements_mediatheque WHERE emprunteurs_pct_population > 100

UNION ALL
SELECT 'médiathèque : amplitude horaire implausible (' || heures_par_semaine || ' h)'
FROM equipements_mediatheque WHERE heures_par_semaine IS NOT NULL AND heures_par_semaine NOT BETWEEN 1 AND 100

UNION ALL
SELECT 'cantines : part bio ou durable hors 0-100 % (' || nom || ')'
FROM equipements_cantines WHERE bio_pct NOT BETWEEN 0 AND 100 OR durable_pct NOT BETWEEN 0 AND 100

UNION ALL
SELECT 'cantines : bio (' || bio_pct || ' %) supérieur au total durable (' || durable_pct || ' %) pour ' || nom
FROM equipements_cantines WHERE bio_pct > durable_pct + 0.05

UNION ALL
SELECT 'cantines : résumé des écoles incohérent avec la liste'
FROM equipements_cantines_ecoles r
WHERE r.cantines_ecoles <> (SELECT count(*) FROM equipements_cantines WHERE ecole);
