-- Énergie & mobilité : les chiffres clés de Luynes, comparés aux 272 communes d'Indre-et-Loire.
-- Rang 1 = la plus forte valeur (la plus forte consommation par logement, le plus de solaire par habitant,
-- la plus forte part de voitures électriques).
-- Résultat : src/data/generated/energie_resume.json (une ligne).
WITH

-- 1) Électricité et gaz des logements, par commune, dernière année (MWh par logement raccordé)
residentiel AS (
  SELECT
    code,
    sum(mwh) FILTER (filiere = 'Electricité') / nullif(sum(sites) FILTER (filiere = 'Electricité'), 0) AS elec_par_logement,
    sum(mwh) FILTER (filiere = 'Gaz')         / nullif(sum(sites) FILTER (filiere = 'Gaz'), 0)         AS gaz_par_logement,
    sum(sites) FILTER (filiere = 'Electricité') AS logements_elec,
    sum(sites) FILTER (filiere = 'Gaz')         AS logements_gaz
  FROM ore_37
  WHERE secteur = 'RESIDENTIEL'
  GROUP BY code
),
residentiel_rangs AS (
  SELECT *, rank() OVER (ORDER BY elec_par_logement DESC NULLS LAST) AS rang_elec FROM residentiel
),
residentiel_dep AS (
  SELECT
    sum(mwh) FILTER (filiere = 'Electricité') / sum(sites) FILTER (filiere = 'Electricité') AS elec_par_logement,
    sum(mwh) FILTER (filiere = 'Gaz')         / sum(sites) FILTER (filiere = 'Gaz')         AS gaz_par_logement
  FROM ore_37 WHERE secteur = 'RESIDENTIEL'
),

-- 2) Panneaux solaires : puissance installée par commune (0 pour les communes sans installation)
solaire AS (
  SELECT
    c.code,
    c.population,
    coalesce(s.puissance_kw, 0)                       AS puissance_kw,
    coalesce(s.installations, 0)                      AS installations,
    1000 * coalesce(s.puissance_kw, 0) / c.population AS kw_pour_1000
  FROM communes_37 c
  LEFT JOIN read_json('data/raw/solaire_communes_37.json') s ON s.codeinseecommune = c.code
),
solaire_rangs AS (
  SELECT *, rank() OVER (ORDER BY kw_pour_1000 DESC) AS rang_solaire FROM solaire
),

-- 3) Voitures particulières : part d'électriques et de diesel par commune, dernière année et 10 ans avant
annees_parc AS (SELECT max(annee) AS fin, min(annee) AS debut FROM parc_vp_37),
parc AS (
  SELECT
    code,
    sum(vehicules) FILTER (annee = (SELECT fin FROM annees_parc))                                         AS voitures,
    100 * sum(vehicules) FILTER (annee = (SELECT fin FROM annees_parc) AND motorisation = 'Électrique')
        / sum(vehicules) FILTER (annee = (SELECT fin FROM annees_parc))                                   AS part_electrique,
    100 * sum(vehicules) FILTER (annee = (SELECT fin FROM annees_parc) AND motorisation = 'Diesel')
        / sum(vehicules) FILTER (annee = (SELECT fin FROM annees_parc))                                   AS part_diesel,
    100 * sum(vehicules) FILTER (annee = (SELECT debut FROM annees_parc) AND motorisation = 'Diesel')
        / sum(vehicules) FILTER (annee = (SELECT debut FROM annees_parc))                                 AS part_diesel_debut
  FROM parc_vp_37
  -- Seulement les 272 communes actuelles (le fichier contient aussi d'anciens codes de communes fusionnées)
  WHERE code IN (SELECT code FROM communes_37)
  GROUP BY code
  HAVING sum(vehicules) FILTER (annee = (SELECT fin FROM annees_parc)) > 0
),
parc_rangs AS (
  SELECT *, rank() OVER (ORDER BY part_electrique DESC) AS rang_electrique FROM parc
),
parc_dep AS (
  SELECT
    100 * sum(vehicules) FILTER (annee = (SELECT fin FROM annees_parc) AND motorisation = 'Électrique')
        / sum(vehicules) FILTER (annee = (SELECT fin FROM annees_parc))   AS part_electrique,
    100 * sum(vehicules) FILTER (annee = (SELECT fin FROM annees_parc) AND motorisation = 'Diesel')
        / sum(vehicules) FILTER (annee = (SELECT fin FROM annees_parc))   AS part_diesel,
    100 * sum(vehicules) FILTER (annee = (SELECT debut FROM annees_parc) AND motorisation = 'Diesel')
        / sum(vehicules) FILTER (annee = (SELECT debut FROM annees_parc)) AS part_diesel_debut
  FROM parc_vp_37
)

SELECT
  (SELECT max(annee) FROM ore_luynes)                         AS annee_energie,
  (SELECT count(*) FROM communes_37)::INTEGER                 AS nb_communes,
  -- Électricité / gaz des logements
  round(r.elec_par_logement, 2)::DOUBLE                       AS elec_mwh_par_logement,
  round(rd.elec_par_logement, 2)::DOUBLE                      AS elec_mwh_par_logement_37,
  r.rang_elec::INTEGER                                        AS rang_elec,
  (SELECT count(*) FROM residentiel WHERE elec_par_logement IS NOT NULL)::INTEGER AS nb_communes_elec,
  round(r.gaz_par_logement, 2)::DOUBLE                        AS gaz_mwh_par_logement,
  round(rd.gaz_par_logement, 2)::DOUBLE                       AS gaz_mwh_par_logement_37,
  r.logements_elec::INTEGER                                   AS logements_elec,
  r.logements_gaz::INTEGER                                    AS logements_gaz,
  round(100 * r.logements_gaz / r.logements_elec, 1)::DOUBLE  AS part_logements_gaz_pct,
  -- Solaire
  round(s.puissance_kw, 0)::INTEGER                           AS solaire_kw,
  s.installations::INTEGER                                    AS solaire_installations,
  round(s.kw_pour_1000, 1)::DOUBLE                            AS solaire_kw_pour_1000,
  round((SELECT 1000 * sum(puissance_kw) / sum(population) FROM solaire), 1)::DOUBLE AS solaire_kw_pour_1000_37,
  s.rang_solaire::INTEGER                                     AS rang_solaire,
  -- Voitures
  (SELECT fin FROM annees_parc)                               AS annee_parc,
  (SELECT debut FROM annees_parc)                             AS annee_parc_debut,
  p.voitures::INTEGER                                         AS voitures,
  round(p.part_electrique, 1)::DOUBLE                         AS part_electrique_pct,
  round(pd.part_electrique, 1)::DOUBLE                        AS part_electrique_37_pct,
  p.rang_electrique::INTEGER                                  AS rang_electrique,
  (SELECT count(*) FROM parc)::INTEGER                        AS nb_communes_parc,
  round(p.part_diesel, 1)::DOUBLE                             AS part_diesel_pct,
  round(p.part_diesel_debut, 1)::DOUBLE                       AS part_diesel_debut_pct,
  round(pd.part_diesel, 1)::DOUBLE                            AS part_diesel_37_pct,
  -- Bornes de recharge dans la commune (une station = une adresse ; voir mobilite_bornes.sql)
  (SELECT count(DISTINCT (b.adresse_station, b.coordonneesXY))
     FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/bornes_recharge.json')) b,
          (SELECT ST_GeomFromGeoJSON(to_json(geometry)) AS g FROM read_json('data/raw/commune_contour.json')) c
     WHERE ST_Contains(c.g, ST_Point(b.coordonneesXY[1], b.coordonneesXY[2])))::INTEGER AS bornes_stations,
  (SELECT count(*)
     FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/bornes_recharge.json')) b,
          (SELECT ST_GeomFromGeoJSON(to_json(geometry)) AS g FROM read_json('data/raw/commune_contour.json')) c
     WHERE ST_Contains(c.g, ST_Point(b.coordonneesXY[1], b.coordonneesXY[2])))::INTEGER AS bornes_points
FROM residentiel_rangs r, residentiel_dep rd, solaire_rangs s, parc_rangs p, parc_dep pd
WHERE r.code = '37139' AND s.code = '37139' AND p.code = '37139';
