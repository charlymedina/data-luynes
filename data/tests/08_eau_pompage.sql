-- Tests de l'eau puisée sous Luynes (BNPE) : volumes plausibles et cohérence résumé / série / ouvrages. Zéro ligne = tout va bien.

SELECT 'eau_pompage : volume potable ' || r.potable_m3 || ' ≠ série ' || a.potable_m3 AS probleme
FROM eau_pompage_resume r, (SELECT potable_m3 FROM eau_pompage_annees ORDER BY annee DESC LIMIT 1) a
WHERE r.potable_m3 IS DISTINCT FROM a.potable_m3

UNION ALL
SELECT 'eau_pompage : volume potable implausible (' || potable_m3 || ' m³)'
FROM eau_pompage_resume WHERE potable_m3 IS NULL OR potable_m3 NOT BETWEEN 10000 AND 5000000

UNION ALL
SELECT 'eau_pompage : volume négatif (' || nom_ouvrage || ')'
FROM eau_pompage_ouvrages WHERE volume_m3 < 0

UNION ALL
SELECT 'eau_pompage : aucun ouvrage listé' WHERE (SELECT count(*) FROM eau_pompage_ouvrages) = 0

UNION ALL
SELECT 'eau_pompage : série incomplète (' || count(*) || ' années)'
FROM eau_pompage_annees
HAVING count(*) < 2 OR count(*) <> max(annee) - min(annee) + 1;
