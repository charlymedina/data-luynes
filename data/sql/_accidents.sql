-- Vues partagées du thème « Accidents de la route » (fichier « _ » : exécuté en premier, ne produit pas de JSON).
-- Source : bases annuelles des accidents corporels (BAAC, ONISR), 2005 → dernière année publiée, archivées pour
-- l'Indre-et-Loire dans data/archive/baac/ par scripts/archive-baac.ts (voir data/sql/baac/ pour l'harmonisation).
-- Un « accident corporel » = au moins une victime (blessé léger, hospitalisé ou tué), constaté par les forces de l'ordre.

-- 1) Un accident par ligne. Les coordonnées hors du département (0, erreurs de saisie) sont mises à NULL.
CREATE OR REPLACE VIEW accidents AS
SELECT
  num_acc,
  annee,
  mois,
  jour_semaine,
  heure,
  luminosite,
  meteo,
  code_commune,
  code_commune = '37139' AS est_luynes,
  CASE WHEN lat BETWEEN 46.7 AND 47.75 AND lon BETWEEN 0.0 AND 1.4 THEN lat END AS lat,
  CASE WHEN lat BETWEEN 46.7 AND 47.75 AND lon BETWEEN 0.0 AND 1.4 THEN lon END AS lon
FROM read_parquet('data/archive/baac/*-caract.parquet');

-- 2) Bilan humain de chaque accident et gravité « la plus haute » (tué > hospitalisé > blessé léger).
--    Attention : depuis 2018, « hospitalisé » = plus de 24 h à l'hôpital (définition harmonisée) ; les années
--    d'avant ne sont donc pas strictement comparables sur ce point.
CREATE OR REPLACE VIEW accidents_bilan AS
SELECT
  num_acc,
  count(*) FILTER (gravite = 2)                    AS tues,
  count(*) FILTER (gravite = 3)                    AS hospitalises,
  count(*) FILTER (gravite = 4)                    AS blesses_legers,
  count(*) FILTER (categorie_usager = 3) > 0       AS pieton,
  CASE
    WHEN count(*) FILTER (gravite = 2) > 0 THEN 'mortel'
    WHEN count(*) FILTER (gravite = 3) > 0 THEN 'grave'
    ELSE 'leger'
  END                                              AS gravite
FROM read_parquet('data/archive/baac/*-usagers.parquet')
GROUP BY num_acc;

-- 3) Qui était impliqué ? Un booléen par mode de déplacement (codes « catv » de l'ONISR, anciens et nouveaux).
CREATE OR REPLACE VIEW accidents_modes AS
SELECT
  num_acc,
  bool_or(categorie_vehicule IN (3, 7, 8, 9, 10, 11, 12))                      AS voiture,      -- voitures et utilitaires
  bool_or(categorie_vehicule IN (2, 4, 5, 6, 30, 31, 32, 33, 34, 41, 42, 43))  AS deux_roues,   -- cyclos, scooters, motos
  bool_or(categorie_vehicule IN (1, 80))                                       AS velo,         -- vélos, vélos électriques
  bool_or(categorie_vehicule IN (13, 14, 15, 16, 17, 18, 20, 21, 37, 38, 39, 40)) AS poids_lourd, -- camions, bus, cars, engins
  bool_or(categorie_vehicule IN (50, 60))                                      AS trottinette   -- trottinettes, engins personnels
FROM read_parquet('data/archive/baac/*-vehicules.parquet')
GROUP BY num_acc;

-- 4) Route de l'accident. Les routes départementales (D) de la métropole sont devenues des routes métropolitaines (M)
--    en 2017 : « D49 » et « M49 » désignent la même route, comptée sous le nom « D49 ». Le reste = voies communales…
CREATE OR REPLACE VIEW accidents_routes AS
SELECT
  num_acc,
  min(
    CASE WHEN categorie_route IN (3, 7) AND regexp_matches(numero_route, '^0*[1-9][0-9]*$')
         THEN 'D' || ltrim(numero_route, '0') END
  ) AS route
FROM read_parquet('data/archive/baac/*-lieux.parquet')
GROUP BY num_acc;

-- 5) Tout réuni, avec des libellés lisibles (moment de la journée, lumière, météo).
CREATE OR REPLACE VIEW accidents_complet AS
SELECT
  a.*,
  coalesce(b.gravite, 'leger')                         AS gravite,
  coalesce(b.tues, 0)                                  AS tues,
  coalesce(b.hospitalises, 0)                          AS hospitalises,
  coalesce(b.blesses_legers, 0)                        AS blesses_legers,
  coalesce(b.pieton, false)                            AS pieton,
  coalesce(m.voiture, false)                           AS voiture,
  coalesce(m.deux_roues, false)                        AS deux_roues,
  coalesce(m.velo, false)                              AS velo,
  coalesce(m.poids_lourd, false)                       AS poids_lourd,
  coalesce(m.trottinette, false)                       AS trottinette,
  r.route,
  CASE
    WHEN a.heure BETWEEN 6 AND 11  THEN 'Matin'
    WHEN a.heure BETWEEN 12 AND 17 THEN 'Après-midi'
    WHEN a.heure BETWEEN 18 AND 21 THEN 'Soirée'
    ELSE 'Nuit'
  END                                                  AS moment,
  CASE a.luminosite
    WHEN 1 THEN 'plein jour' WHEN 2 THEN 'aube ou crépuscule'
    WHEN 3 THEN 'nuit sans éclairage' WHEN 4 THEN 'nuit, éclairage éteint' WHEN 5 THEN 'nuit éclairée'
  END                                                  AS lumiere,
  CASE a.meteo
    WHEN 1 THEN 'temps normal' WHEN 2 THEN 'pluie légère' WHEN 3 THEN 'forte pluie' WHEN 4 THEN 'neige ou grêle'
    WHEN 5 THEN 'brouillard' WHEN 6 THEN 'vent fort' WHEN 7 THEN 'temps éblouissant' WHEN 8 THEN 'temps couvert'
  END                                                  AS meteo_libelle
FROM accidents a
LEFT JOIN accidents_bilan b USING (num_acc)
LEFT JOIN accidents_modes m USING (num_acc)
LEFT JOIN accidents_routes r USING (num_acc);
