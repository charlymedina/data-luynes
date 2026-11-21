-- Vues partagées du thème « Vie quotidienne » (fichier « _ » : exécuté en premier, ne produit pas de JSON).
-- Sources : ARCEP (fibre), Géo'DAE (défibrillateurs), Registre de preuve de covoiturage, Tours Métropole (verre, textile, bancs).
-- Le code postal 37230 est partagé avec Fondettes : on filtre toujours sur le code INSEE.

-- 1) Fibre : une ligne par commune d'Indre-et-Loire et par trimestre publié.
--    « locaux » = locaux (logements, entreprises…) recensés par l'ARCEP ; « fibre » = ceux raccordables à la fibre jusqu'au domicile (FttH).
CREATE OR REPLACE VIEW quotidien_fibre AS
SELECT
  code_insee                AS code,
  date::DATE                AS date_fin,
  nbr::INTEGER              AS locaux,
  elig_ftth::INTEGER        AS fibre
FROM read_parquet('data/raw/quotidien_fibre_37.parquet')
WHERE nbr::INTEGER > 0;

-- 2) Défibrillateurs : un par ligne, sans les doublons signalés par la base ni ceux hors service ou absents.
CREATE OR REPLACE VIEW quotidien_dae AS
SELECT
  c_com_insee                              AS code,
  c_nom                                    AS nom,
  c_adr_voie                               AS voie,
  c_acc = 'Extérieur'                      AS exterieur,
  c_dispo_horaires = '24/7'                AS permanent,   -- « 24/7 » dans la base ; l'autre valeur courante est « Mo-Su off »
  c_dae_mobile = 't'                       AS mobile,
  c_lat_coor1::DOUBLE                      AS lat,
  c_long_coor1::DOUBLE                     AS lon
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/quotidien_dae_37.json'))
WHERE c_doublon IS DISTINCT FROM 't' AND c_etat_fonct = 'En fonctionnement';

-- 3) Covoiturage : trajets par commune de départ et par an (une commune sans trajet enregistré est absente du fichier).
CREATE OR REPLACE VIEW quotidien_covoiturage AS
SELECT geocode_commune AS code, annee::INTEGER AS annee, valeur::DOUBLE::INTEGER AS trajets
FROM read_parquet('data/raw/quotidien_covoiturage_37.parquet');

-- 4) Points d'apport volontaire du verre de Tours Métropole (toute la métropole, pour comparer).
CREATE OR REPLACE VIEW quotidien_verre AS
SELECT city_insee_code AS code, geo_coordinates.lat::DOUBLE AS lat, geo_coordinates.lon::DOUBLE AS lon, geographic_address AS adresse
FROM read_json('data/raw/quotidien_verre_metropole.json');
