-- Pyramide des âges de Luynes (dernier recensement), par tranches de 5 ans,
-- avec la même pyramide pour la France en comparaison (en % de la population totale).
-- Résultat : src/data/generated/population_pyramide.json (une ligne par tranche, des plus âgés aux plus jeunes).
WITH derniere_annee AS (
  SELECT max(annee) AS annee FROM age_sexe WHERE territoire = 'Luynes'
),

tranches AS (
  SELECT
    territoire,
    sexe,
    least(age // 5, 18) AS tranche,     -- 0 = 0-4 ans, 1 = 5-9 ans… 18 = 90 ans et plus
    sum(habitants)      AS habitants
  FROM age_sexe
  WHERE annee = (SELECT annee FROM derniere_annee)
    AND territoire IN ('Luynes', 'France')
  GROUP BY ALL
),

parts AS (
  SELECT *, 100 * habitants / sum(habitants) OVER (PARTITION BY territoire) AS part
  FROM tranches
)

SELECT
  tranche                                                               AS ordre,
  CASE WHEN tranche = 18 THEN '90 ans et +'
       ELSE (tranche * 5) || '-' || (tranche * 5 + 4) || ' ans' END     AS libelle,
  round(sum(habitants) FILTER (territoire = 'Luynes' AND sexe = 'F'))::INTEGER AS femmes,
  round(sum(habitants) FILTER (territoire = 'Luynes' AND sexe = 'M'))::INTEGER AS hommes,
  round(sum(part) FILTER (territoire = 'Luynes' AND sexe = 'F'), 2)::DOUBLE    AS part_femmes,
  round(sum(part) FILTER (territoire = 'Luynes' AND sexe = 'M'), 2)::DOUBLE    AS part_hommes,
  round(sum(part) FILTER (territoire = 'France' AND sexe = 'F'), 2)::DOUBLE    AS part_femmes_france,
  round(sum(part) FILTER (territoire = 'France' AND sexe = 'M'), 2)::DOUBLE    AS part_hommes_france,
  (SELECT annee FROM derniere_annee)                                    AS annee
FROM parts
GROUP BY tranche
ORDER BY tranche DESC;
