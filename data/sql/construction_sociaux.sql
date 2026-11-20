-- Logements sociaux de Luynes (RPLS) regroupés par taille (nombre de pièces) et par époque de construction.
-- Résultat : src/data/generated/construction_sociaux.json (une ligne par groupe)
SELECT 'pieces' AS dimension, ordre, libelle, count(*)::INTEGER AS logements
FROM (
  SELECT
    least(coalesce(pieces, 0), 5) AS ordre,
    CASE WHEN pieces IS NULL THEN 'Non renseigné' WHEN pieces >= 5 THEN '5 pièces et plus' ELSE pieces || ' pièce' || CASE WHEN pieces > 1 THEN 's' ELSE '' END END AS libelle
  FROM logements_sociaux
)
GROUP BY ALL

UNION ALL

SELECT 'epoque', ordre, libelle, count(*)::INTEGER
FROM (
  SELECT
    CASE WHEN annee_construction < 1970 THEN 1 WHEN annee_construction < 1990 THEN 2
         WHEN annee_construction < 2010 THEN 3 WHEN annee_construction IS NOT NULL THEN 4 ELSE 5 END AS ordre,
    CASE WHEN annee_construction < 1970 THEN 'Avant 1970' WHEN annee_construction < 1990 THEN '1970-1989'
         WHEN annee_construction < 2010 THEN '1990-2009' WHEN annee_construction IS NOT NULL THEN '2010 et après'
         ELSE 'Non renseigné' END AS libelle
  FROM logements_sociaux
)
GROUP BY ALL
ORDER BY dimension, ordre;
