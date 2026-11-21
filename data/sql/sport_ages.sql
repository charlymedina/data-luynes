-- Âge des licenciés : part de chaque grande tranche d'âge dans les licences de Luynes et d'Indre-et-Loire (dernière année).
-- Les licences d'âge inconnu (colonnes « NR ») sont écartées du calcul des parts.
-- Résultat : src/data/generated/sport_ages.json (une ligne par tranche)
WITH fin AS (SELECT max(annee) AS annee FROM sport_licences),
tranches AS (
  SELECT 1 AS ordre, '0-14 ans' AS tranche,
         sum(age_0_14) FILTER (code = '37139') AS luynes, sum(age_0_14) AS departement
  FROM sport_licences, fin WHERE sport_licences.annee = fin.annee
  UNION ALL
  SELECT 2, '15-29 ans', sum(age_15_29) FILTER (code = '37139'), sum(age_15_29)
  FROM sport_licences, fin WHERE sport_licences.annee = fin.annee
  UNION ALL
  SELECT 3, '30-44 ans', sum(age_30_44) FILTER (code = '37139'), sum(age_30_44)
  FROM sport_licences, fin WHERE sport_licences.annee = fin.annee
  UNION ALL
  SELECT 4, '45-59 ans', sum(age_45_59) FILTER (code = '37139'), sum(age_45_59)
  FROM sport_licences, fin WHERE sport_licences.annee = fin.annee
  UNION ALL
  SELECT 5, '60 ans et plus', sum(age_60_plus) FILTER (code = '37139'), sum(age_60_plus)
  FROM sport_licences, fin WHERE sport_licences.annee = fin.annee
)
SELECT
  tranche,
  luynes::INTEGER AS licences,
  round(100 * luynes / sum(luynes) OVER (), 1)::DOUBLE AS part_luynes,
  round(100 * departement / sum(departement) OVER (), 1)::DOUBLE AS part_37
FROM tranches
ORDER BY ordre;
