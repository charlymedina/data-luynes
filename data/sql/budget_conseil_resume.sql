-- Le conseil municipal en chiffres : nombre d'élus, parité, âge moyen, exécutif (maire et adjoints),
-- comparés à la population de Luynes (dernier recensement) : part des femmes et âge moyen des habitants de 18 ans et plus.
-- Aucun nom, aucune date de naissance. Résultat : src/data/generated/budget_conseil_resume.json (une ligne).
WITH population AS (
  SELECT
    annee,
    round(100 * sum(habitants) FILTER (sexe = 'F') / sum(habitants), 1)::DOUBLE AS part_femmes_population,
    -- âge révolu (en années entières), comme pour les élus : les deux moyennes se comparent à définition égale
    round(sum(habitants * age) / sum(habitants), 1)::DOUBLE                     AS age_moyen_population
  FROM age_sexe
  WHERE territoire = 'Luynes' AND annee = (SELECT max(annee) FROM age_sexe WHERE territoire = 'Luynes') AND age >= 18
  GROUP BY annee
)

SELECT
  count(*)::INTEGER                                              AS nb_elus,
  count(*) FILTER (sexe = 'F')::INTEGER                          AS femmes,
  count(*) FILTER (sexe = 'M')::INTEGER                          AS hommes,
  round(100 * count(*) FILTER (sexe = 'F') / count(*), 1)::DOUBLE AS part_femmes,
  round(avg(age), 1)::DOUBLE                                     AS age_moyen,
  count(*) FILTER (fonction ILIKE '%maire%')::INTEGER            AS nb_executif,
  count(*) FILTER (fonction ILIKE '%maire%' AND sexe = 'F')::INTEGER AS femmes_executif,
  min(debut_mandat)                                              AS debut_mandat,
  (SELECT part_femmes_population FROM population)                AS part_femmes_population,
  (SELECT age_moyen_population FROM population)                  AS age_moyen_population,
  (SELECT annee FROM population)                                 AS annee_recensement
FROM conseil;
