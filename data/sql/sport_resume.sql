-- Chiffres clés du sport à Luynes : licences sportives (dernière année) et équipements, comparés à l'Indre-et-Loire.
-- « Pour 100 habitants » : licences ÷ population légale (API Géo) × 100. Rang 1 = le plus de licences par habitant.
-- Résultat : src/data/generated/sport_resume.json (une ligne)
WITH annees AS (
  SELECT min(annee) AS annee_debut, max(annee) AS annee_fin FROM sport_licences
),

-- Licences de chaque commune à la dernière année
dernieres AS (
  SELECT code, sum(total) AS licences, sum(femmes) AS femmes, sum(hommes) AS hommes,
         sum(total) FILTER (scolaire) AS scolaires, count(*) AS federations
  FROM sport_licences, annees
  WHERE annee = annee_fin
  GROUP BY code
),

classement AS (
  SELECT
    c.code,
    100 * coalesce(d.licences, 0) / c.population                              AS pour_100,
    rank() OVER (ORDER BY 100 * coalesce(d.licences, 0) / c.population DESC)   AS rang,
    count(*) OVER ()                                                           AS nb_communes
  FROM communes_37 c
  LEFT JOIN dernieres d USING (code)
),

departement AS (
  SELECT
    sum(licences)                                    AS licences,
    100 * sum(licences) / (SELECT sum(population) FROM communes_37) AS pour_100,
    100 * sum(femmes) / sum(femmes + hommes)         AS femmes_pct
  FROM dernieres
),

-- Évolution du nombre de licences entre la première et la dernière année lues
evolution AS (
  SELECT
    100 * (sum(total) FILTER (code = '37139' AND annee = annee_fin) / sum(total) FILTER (code = '37139' AND annee = annee_debut) - 1) AS luynes_pct,
    100 * (sum(total) FILTER (annee = annee_fin) / sum(total) FILTER (annee = annee_debut) - 1)                                      AS departement_pct
  FROM sport_licences, annees
),

-- Équipements : lignes recensées par commune (RES), 0 pour les communes absentes du fichier
equip_communes AS (
  SELECT c.code, c.population, count(e.equip_numero) AS equipements
  FROM communes_37 c
  LEFT JOIN sport_equipements_37 e ON e.new_code = c.code
  GROUP BY c.code, c.population
),

equip_rang AS (
  SELECT code, equipements, 1000 * equipements / population AS pour_1000,
         rank() OVER (ORDER BY equipements / population DESC) AS rang,
         count(*) OVER () AS nb_communes
  FROM equip_communes
)

SELECT
  a.annee_debut::INTEGER                                                   AS annee_debut,
  a.annee_fin::INTEGER                                                     AS annee_fin,
  (SELECT population FROM communes_37 WHERE code = '37139')::INTEGER        AS population,
  l.licences::INTEGER                                                      AS licences,
  l.federations::INTEGER                                                   AS federations,
  coalesce(l.scolaires, 0)::INTEGER                                        AS licences_scolaires,
  round(k.pour_100, 1)::DOUBLE                                             AS licences_pour_100,
  round(d.pour_100, 1)::DOUBLE                                             AS licences_pour_100_37,
  k.rang::INTEGER                                                          AS rang_licences,
  k.nb_communes::INTEGER                                                   AS nb_communes_licences,
  round(100 * l.femmes / (l.femmes + l.hommes), 1)::DOUBLE                 AS femmes_pct,
  round(d.femmes_pct, 1)::DOUBLE                                           AS femmes_pct_37,
  round(ev.luynes_pct, 1)::DOUBLE                                          AS evolution_luynes_pct,
  round(ev.departement_pct, 1)::DOUBLE                                     AS evolution_37_pct,
  q.equipements::INTEGER                                                   AS equipements,
  (SELECT count(DISTINCT inst_numero) FROM sport_equipements_luynes)::INTEGER AS installations,
  round(q.pour_1000, 1)::DOUBLE                                            AS equipements_pour_1000,
  round(1000 * (SELECT sum(equipements) FROM equip_rang) / (SELECT sum(population) FROM communes_37), 1)::DOUBLE AS equipements_pour_1000_37,
  q.rang::INTEGER                                                          AS rang_equipements,
  q.nb_communes::INTEGER                                                   AS nb_communes_equipements,
  (SELECT count(*) FROM sport_equipements WHERE lat IS NOT NULL)::INTEGER  AS equipements_localises,
  (SELECT count(DISTINCT installation) FILTER (installation_accessible) FROM sport_equipements)::INTEGER AS installations_accessibles,
  (SELECT count(*) FILTER (annee_travaux IS NOT NULL) FROM sport_equipements)::INTEGER AS equipements_renoves,
  (SELECT count(*) FILTER (hors_service) FROM sport_equipements)::INTEGER  AS equipements_hors_service
FROM annees a, dernieres l, classement k, departement d, evolution ev, equip_rang q
WHERE l.code = '37139' AND k.code = '37139' AND q.code = '37139';
