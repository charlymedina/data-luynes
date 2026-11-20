-- Chiffres clés de la construction (Sitadel, années complètes) et du logement social (RPLS) à Luynes.
-- Résultat : src/data/generated/construction_resume.json (une ligne)
WITH annees AS (
  SELECT
    annee,
    sum(commences) FILTER (type_logement = 'Tous Logements') AS commences,
    sum(autorises) FILTER (type_logement = 'Tous Logements') AS autorises,
    sum(commences) FILTER (type_logement = 'Collectif')      AS collectifs
  FROM sitadel
  WHERE annee IN (SELECT annee FROM sitadel_annees_completes)
  GROUP BY annee
),

record AS (SELECT annee, commences FROM annees ORDER BY commences DESC, annee DESC LIMIT 1),

-- les 10 dernières années complètes
recentes AS (SELECT * FROM annees WHERE annee > (SELECT max(annee) FROM annees) - 10),

social AS (
  SELECT
    count(*)                                                  AS logements_sociaux,
    round(avg(surface))                                       AS surface_moyenne,
    count(*) FILTER (annee_construction >= (SELECT max(annee) FROM annees) - 9) AS sociaux_recents,
    count(*) FILTER (dpe IN ('F', 'G'))                       AS sociaux_passoires,
    count(*) FILTER (dpe IS NOT NULL)                         AS sociaux_avec_dpe
  FROM logements_sociaux
)

SELECT
  (SELECT min(annee) FROM annees)::INTEGER                        AS annee_debut,
  (SELECT max(annee) FROM annees)::INTEGER                        AS annee_fin,
  (SELECT sum(commences) FROM annees)::INTEGER                    AS commences_total,
  (SELECT sum(autorises) FROM annees)::INTEGER                    AS autorises_total,
  round((SELECT avg(commences) FROM annees), 1)::DOUBLE           AS commences_par_an,
  round((SELECT avg(commences) FROM recentes), 1)::DOUBLE         AS commences_par_an_10_ans,
  round(100 * (SELECT sum(collectifs) FROM annees) / nullif((SELECT sum(commences) FROM annees), 0), 1)::DOUBLE AS part_collectifs,
  (SELECT annee FROM record)::INTEGER                             AS annee_record,
  (SELECT commences FROM record)::INTEGER                         AS commences_record,
  s.logements_sociaux::INTEGER                                    AS logements_sociaux,
  s.surface_moyenne::INTEGER                                      AS surface_moyenne_sociaux,
  s.sociaux_recents::INTEGER                                      AS sociaux_recents,
  round(100 * s.sociaux_passoires / nullif(s.sociaux_avec_dpe, 0), 1)::DOUBLE AS part_passoires_sociaux
FROM social s;
