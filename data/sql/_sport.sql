-- Vues partagées du thème « Sport » (fichier « _ » : exécuté en premier, ne produit pas de JSON).
-- Sources : licences sportives par commune de résidence (INJEP / ministère des Sports) et recensement des
-- équipements sportifs (RES, « Data ES »).
-- ⚠ Une « licence » n'est pas une personne : quelqu'un qui est licencié dans deux fédérations compte deux fois.

-- 1) Licences : une ligne par commune d'Indre-et-Loire, année et fédération, avec le sexe et des tranches d'âge.
--    Les fichiers ont une colonne par sexe et par tranche de 5 ans ; on les regroupe en 5 grandes tranches.
CREATE OR REPLACE VIEW sport_licences AS
SELECT
  "Code Commune"                                        AS code,
  regexp_extract(fichier, 'lic-data-(\d{4})', 1)::INTEGER AS annee,
  "Code"                                                AS code_federation,
  "Fédération"                                          AS federation,
  -- les fédérations du sport scolaire et universitaire (UNSS, UGSEL, USEP…) ont un code en 6xx
  left("Code", 1) = '6'                                 AS scolaire,
  "Total"::INTEGER                                      AS total,
  list_sum([c::INTEGER FOR c IN [ "F - 1 à 4 ans", "F - 5 à 9 ans", "F - 10 à 14 ans", "F - 15 à 19 ans", "F - 20 à 24 ans",
    "F - 25 à 29 ans", "F - 30 à 34 ans", "F - 35 à 39 ans", "F - 40 à 44 ans", "F - 45 à 49 ans", "F - 50 à 54 ans",
    "F - 55 à 59 ans", "F - 60 à 64 ans", "F - 65 à 69 ans", "F - 70 à 74 ans", "F - 75 à 79 ans", "F - 80 à 99 ans" ]]) AS femmes,
  list_sum([c::INTEGER FOR c IN [ "H - 1 à 4 ans", "H - 5 à 9 ans", "H - 10 à 14 ans", "H - 15 à 19 ans", "H - 20 à 24 ans",
    "H - 25 à 29 ans", "H - 30 à 34 ans", "H - 35 à 39 ans", "H - 40 à 44 ans", "H - 45 à 49 ans", "H - 50 à 54 ans",
    "H - 55 à 59 ans", "H - 60 à 64 ans", "H - 65 à 69 ans", "H - 70 à 74 ans", "H - 75 à 79 ans", "H - 80 à 99 ans" ]]) AS hommes,
  "F - 1 à 4 ans"::INTEGER + "F - 5 à 9 ans"::INTEGER + "F - 10 à 14 ans"::INTEGER
    + "H - 1 à 4 ans"::INTEGER + "H - 5 à 9 ans"::INTEGER + "H - 10 à 14 ans"::INTEGER                       AS age_0_14,
  "F - 15 à 19 ans"::INTEGER + "F - 20 à 24 ans"::INTEGER + "F - 25 à 29 ans"::INTEGER
    + "H - 15 à 19 ans"::INTEGER + "H - 20 à 24 ans"::INTEGER + "H - 25 à 29 ans"::INTEGER                   AS age_15_29,
  "F - 30 à 34 ans"::INTEGER + "F - 35 à 39 ans"::INTEGER + "F - 40 à 44 ans"::INTEGER
    + "H - 30 à 34 ans"::INTEGER + "H - 35 à 39 ans"::INTEGER + "H - 40 à 44 ans"::INTEGER                   AS age_30_44,
  "F - 45 à 49 ans"::INTEGER + "F - 50 à 54 ans"::INTEGER + "F - 55 à 59 ans"::INTEGER
    + "H - 45 à 49 ans"::INTEGER + "H - 50 à 54 ans"::INTEGER + "H - 55 à 59 ans"::INTEGER                   AS age_45_59,
  "F - 60 à 64 ans"::INTEGER + "F - 65 à 69 ans"::INTEGER + "F - 70 à 74 ans"::INTEGER + "F - 75 à 79 ans"::INTEGER + "F - 80 à 99 ans"::INTEGER
    + "H - 60 à 64 ans"::INTEGER + "H - 65 à 69 ans"::INTEGER + "H - 70 à 74 ans"::INTEGER + "H - 75 à 79 ans"::INTEGER + "H - 80 à 99 ans"::INTEGER AS age_60_plus,
  "F - NR"::INTEGER + "H - NR"::INTEGER                                                                      AS inconnu
FROM read_parquet('data/raw/sport_licences_37.parquet');

-- 2) Équipements sportifs (RES) : Luynes (tous les champs utiles) et Indre-et-Loire (comptages).
--    Une ligne = un équipement ; certaines lignes sont des « activités » d'une installation sans détail
--    (pas de type ni de position) : elles comptent comme équipements recensés mais ne sont pas sur la carte.
CREATE OR REPLACE VIEW sport_equipements_luynes AS
SELECT *
FROM read_csv('data/raw/sport_equipements_luynes/*', delim = ';', header = true, all_varchar = true);

CREATE OR REPLACE VIEW sport_equipements_37 AS
SELECT *
FROM read_csv('data/raw/sport_equipements_37/*', delim = ';', header = true, all_varchar = true);

-- 3) Périodes de mise en service utilisées par le RES, de la plus ancienne à la plus récente
--    (libelle_res = écriture exacte du RES, pour rapprocher les équipements sans année précise).
CREATE OR REPLACE VIEW sport_periodes AS
SELECT * FROM (VALUES
  (1, 'Avant 1945',     'Avant 1945',       0,    1944),
  (2, '1945-1964',      '1945-1964',     1945,    1964),
  (3, '1965-1974',      '1965-1974',     1965,    1974),
  (4, '1975-1984',      '1975-1984',     1975,    1984),
  (5, '1985-1994',      '1985-1994',     1985,    1994),
  (6, '1995-2004',      '1995-2004',     1995,    2004),
  (7, 'Depuis 2005',    'A partir de 2005', 2005, 9999)
) AS t(ordre, periode, libelle_res, de, a);

-- 4) Équipements de Luynes : type lisible, année ou période de mise en service, position.
CREATE OR REPLACE VIEW sport_equipements AS
SELECT
  e.equip_numero                                          AS id,
  coalesce(nullif(trim(e.equip_nom), ''), e.inst_nom)      AS nom,
  e.inst_nom                                              AS installation,
  trim(e.inst_adresse)                                    AS adresse,
  -- type : la famille du RES ; à défaut (ligne sans détail), la première activité sportive citée
  coalesce(e.equip_type_famille, nullif(trim(split_part(e.aps_name, ',', 1)), ''), 'Autre') AS type,
  e.equip_service_date::INTEGER                           AS annee_service,
  p.ordre                                                 AS ordre_periode,
  p.periode                                               AS periode_service,
  e.equip_travaux_date::INTEGER                           AS annee_travaux,
  e.equip_y::DOUBLE                                       AS lat,
  e.equip_x::DOUBLE                                       AS lon,
  e.equip_nature                                          AS nature,
  e.equip_ouv_public_bool = 'true'                        AS ouvert_public,
  e.equip_acc_libre = 'true'                              AS acces_libre,
  e.inst_acc_handi_bool = 'true'                          AS installation_accessible,
  e.inst_hs_bool = 'Oui'                                  AS hors_service
FROM sport_equipements_luynes e
LEFT JOIN sport_periodes p
  ON (e.equip_service_date IS NOT NULL AND e.equip_service_date::INTEGER BETWEEN p.de AND p.a)
  OR (e.equip_service_date IS NULL AND e.equip_service_periode = p.libelle_res);
