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
-- Les 2 notices du château de Condé-en-Brie (Aisne) portent à tort le code 37139 en « commune actuelle » : elles ne doivent jamais revenir
SELECT 'palissy : notice d''une autre commune (' || Reference || ', ' || Commune_forme_editoriale || ')'
FROM read_parquet('data/raw/palissy_luynes.parquet') WHERE COG_Insee IS DISTINCT FROM '37139'

UNION ALL
SELECT 'palissy : notice de Condé-en-Brie retenue (' || reference || ')' FROM patrimoine_objets WHERE reference IN ('PM02000303', 'PM02000307')

UNION ALL
SELECT 'palissy : somme des siècles (' || s.n || ') > objets (' || r.objets || ')'
FROM patrimoine_objets_resume r, (SELECT coalesce(sum(objets), 0) AS n FROM patrimoine_objets_siecles) s
WHERE s.n > r.objets;
