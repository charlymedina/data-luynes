-- Tests des objets mobiliers protégés (Palissy) : cohérence et plausibilité. Zéro ligne = tout va bien.
SELECT 'palissy : résumé (' || r.objets || ') ≠ liste (' || l.n || ')' AS probleme
FROM patrimoine_objets_resume r, (SELECT count(*) AS n FROM patrimoine_objets) l
WHERE r.objets <> l.n

UNION ALL
SELECT 'palissy : aucun objet protégé trouvé' FROM patrimoine_objets_resume WHERE objets = 0

UNION ALL
SELECT 'palissy : siècle hors 5-21 (' || reference || ')' FROM patrimoine_objets WHERE siecle IS NOT NULL AND siecle NOT BETWEEN 5 AND 21

UNION ALL
SELECT 'palissy : année de protection implausible (' || reference || ')' FROM patrimoine_objets WHERE annee_protection NOT BETWEEN 1900 AND 2100 OR annee_protection IS NULL

UNION ALL
SELECT 'palissy : doublon de référence ' || reference FROM patrimoine_objets GROUP BY reference HAVING count(*) > 1

UNION ALL
SELECT 'palissy : somme des siècles (' || s.n || ') > objets (' || r.objets || ')'
FROM patrimoine_objets_resume r, (SELECT coalesce(sum(objets), 0) AS n FROM patrimoine_objets_siecles) s
WHERE s.n > r.objets;
