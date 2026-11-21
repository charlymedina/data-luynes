-- Vues partagées du thème « Écoles, santé & services » (fichier « _ » : exécuté en premier, ne produit pas de JSON).

-- 1) Libellés des codes de la base permanente des équipements (BPE), extraits du référentiel INSEE
--    (data/reference/bpe_libelles.csv : niveau = FACILITY_DOM / FACILITY_SDOM / FACILITY_TYPE).
CREATE OR REPLACE VIEW bpe_libelles AS
SELECT niveau, code, libelle FROM read_csv('data/reference/bpe_libelles.csv', delim = ';', header = true);

-- 2) Nombre d'équipements par type, à Luynes et en Indre-et-Loire, pour la dernière année de la BPE.
CREATE OR REPLACE VIEW bpe AS
WITH observations AS (
  SELECT 'Luynes' AS territoire, unnest(observations) AS o FROM read_json('data/raw/bpe_luynes.json')
  UNION ALL
  SELECT 'Indre-et-Loire', unnest(observations) FROM read_json('data/raw/bpe_37.json')
),
lignes AS (
  SELECT
    territoire,
    o.dimensions.TIME_PERIOD::INTEGER  AS annee,
    o.dimensions.FACILITY_DOM          AS domaine,
    o.dimensions.FACILITY_SDOM         AS sous_domaine,
    o.dimensions.FACILITY_TYPE         AS type,
    o.measures.OBS_VALUE_NIVEAU.value  AS nombre
  FROM observations
)
SELECT * FROM lignes WHERE annee = (SELECT max(annee) FROM lignes);

-- 3) Populations utilisées pour les taux « pour 1 000 habitants » (populations légales, API Géo).
CREATE OR REPLACE VIEW populations_equipements AS
SELECT 'Luynes' AS territoire, population FROM read_json('data/raw/commune.json')
UNION ALL
SELECT 'Indre-et-Loire', sum(population) FROM read_json('data/raw/communes_37.json');

-- 4) Élèves des écoles (maternelles et élémentaires, publiques et privées) à chaque rentrée.
--    Les effectifs de Luynes sont filtrés en amont sur le nom de la commune (le code « commune » de ce
--    fichier est en réalité le code postal 37230, partagé avec Fondettes).
CREATE OR REPLACE VIEW effectifs_ecoles AS
SELECT
  left(rentree_scolaire, 4)::INTEGER AS rentree,
  numero_ecole,
  patronyme,
  secteur,
  nombre_total_classes              AS classes,
  nombre_total_eleves               AS eleves
FROM read_json('data/raw/effectifs_ecoles_luynes.json');

-- 4) Médiathèque de Luynes (enquête annuelle du Service du livre et de la lecture, ministère de la Culture).
--    Le fichier ne contient pas l'année de l'enquête : elle est lue dans la description du jeu sur data.gouv.fr
--    (« … chiffres-clés pour l'année 2023 »).
CREATE OR REPLACE VIEW mediatheque AS
SELECT
  d."nom_de_l_etablissement"                                 AS nom,
  d."Adresse"                                                AS adresse,
  d."Surface"::DOUBLE                                        AS surface_m2,
  d."nombre_de_places"::INTEGER                              AS places,
  d."nb_postes_informatiques_publics"::INTEGER               AS postes_informatiques,
  d."Amplitude horaire"::DOUBLE                              AS heures_par_semaine,   -- ouverture hebdomadaire habituelle
  d."ouverture_le_dimanche"                                  AS ouverte_dimanche,
  d."connexion_wi_fi"                                        AS wifi,
  d."nombre_de_livres"::INTEGER                              AS livres,
  d."nombre_de_cd"::INTEGER                                  AS cd,
  d."nombre_de_dvd"::INTEGER                                 AS dvd,
  d."nombre_d_emprunteurs"::INTEGER                          AS emprunteurs,
  d."nombre_de_prets"::INTEGER                               AS prets,
  d."nombre_actions_culturelles"::INTEGER                    AS actions_culturelles,
  d."pop_touchee_actions_culturelles"::INTEGER               AS personnes_touchees,
  d."gratuite_des_services"                                  AS gratuite,
  TRY_CAST(regexp_extract((SELECT description FROM read_json('data/raw/mediatheque_jeu.json')), 'pour l.ann[ée]e (\d{4})', 1) AS INTEGER) AS annee
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/mediatheque_luynes.json')) d;

-- 5) Cantines de Luynes déclarées sur « Ma Cantine » (loi EGalim) : une ligne par cantine et par année.
--    Les parts sont des fractions (0,217 = 21,7 %) ; « durable et de qualité » = bio + autres produits EGalim.
--    Une cantine qui reçoit ses repas d'une cuisine centrale déclare les chiffres de cette cuisine.
CREATE OR REPLACE VIEW cantines AS
SELECT
  year::INTEGER                                                    AS annee,
  canteen_name                                                     AS nom,
  canteen_sector_list                                              AS secteur,
  canteen_central_kitchen_siret                                    AS cuisine_centrale,
  100 * teledeclaration_ratio_bio::DOUBLE                          AS bio_pct,
  100 * (teledeclaration_ratio_bio::DOUBLE + teledeclaration_ratio_egalim_hors_bio::DOUBLE) AS durable_pct,
  canteen_sector_list LIKE '%Ecole%'                               AS ecole
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/cantines_luynes.json'));
