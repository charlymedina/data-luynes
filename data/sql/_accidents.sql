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
  jour,
  jour_semaine,
  heure,
  minute,
  luminosite,
  meteo,
  agglomeration,
  intersection,
  collision,
  code_commune,
  code_commune = '37139' AS est_luynes,
  CASE WHEN lat BETWEEN 46.7 AND 47.75 AND lon BETWEEN 0.0 AND 1.4 THEN lat END AS lat,
  CASE WHEN lat BETWEEN 46.7 AND 47.75 AND lon BETWEEN 0.0 AND 1.4 THEN lon END AS lon
-- union_by_name : tolère des années archivées avec des colonnes différentes (archive en cours de mise à jour)
FROM read_parquet('data/archive/baac/*-caract.parquet', union_by_name = true);

-- 2) Bilan humain de chaque accident et gravité « la plus haute » (tué > hospitalisé > blessé léger).
--    « Hospitalisé » = plus de 24 h à l'hôpital (définition en vigueur depuis 2005) ; depuis 2018, ce chiffre n'est
--    plus labellisé « statistique publique » par l'ONISR : à lire avec prudence.
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
FROM read_parquet('data/archive/baac/*-usagers.parquet', union_by_name = true)
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
FROM read_parquet('data/archive/baac/*-vehicules.parquet', union_by_name = true)
GROUP BY num_acc;

-- 4) Route de l'accident. Les routes départementales (D) de la métropole sont devenues des routes métropolitaines (M)
--    en 2017 : « D49 » et « M49 » désignent la même route, comptée sous le nom « D49 ». Le reste = voies communales…
CREATE OR REPLACE VIEW accidents_routes AS
SELECT
  num_acc,
  min(
    CASE WHEN categorie_route IN (3, 7) AND regexp_matches(numero_route, '^0*[1-9][0-9]*$')
         THEN 'D' || ltrim(numero_route, '0') END
  ) AS route,
  min(categorie_route) AS categorie_route,
  min(surface)         AS surface,
  max(vitesse_max)     AS vitesse_max
FROM read_parquet('data/archive/baac/*-lieux.parquet', union_by_name = true)
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
  r.vitesse_max,
  CASE r.categorie_route
    WHEN 1 THEN 'autoroute' WHEN 2 THEN 'route nationale' WHEN 3 THEN 'route départementale'
    WHEN 4 THEN 'voie communale' WHEN 5 THEN 'hors réseau public' WHEN 6 THEN 'parking'
    WHEN 7 THEN 'route métropolitaine' WHEN 9 THEN 'autre voie'
  END                                                  AS type_route,
  CASE r.surface
    WHEN 1 THEN 'chaussée normale' WHEN 2 THEN 'chaussée mouillée' WHEN 3 THEN 'flaques' WHEN 4 THEN 'chaussée inondée'
    WHEN 5 THEN 'chaussée enneigée' WHEN 6 THEN 'boue' WHEN 7 THEN 'verglas' WHEN 8 THEN 'corps gras' WHEN 9 THEN 'autre état'
  END                                                  AS etat_chaussee,
  CASE a.intersection
    WHEN 1 THEN 'hors intersection' WHEN 2 THEN 'intersection en X' WHEN 3 THEN 'intersection en T'
    WHEN 4 THEN 'intersection en Y' WHEN 5 THEN 'intersection à plus de 4 branches' WHEN 6 THEN 'giratoire'
    WHEN 7 THEN 'place' WHEN 8 THEN 'passage à niveau' WHEN 9 THEN 'autre intersection'
  END                                                  AS intersection_libelle,
  CASE a.collision
    WHEN 1 THEN 'collision frontale' WHEN 2 THEN 'collision par l''arrière' WHEN 3 THEN 'collision par le côté'
    WHEN 4 THEN 'collision en chaîne' WHEN 5 THEN 'collisions multiples' WHEN 6 THEN 'autre collision'
    WHEN 7 THEN 'sans collision'
  END                                                  AS collision_libelle,
  CASE a.agglomeration WHEN 1 THEN 'hors agglomération' WHEN 2 THEN 'en agglomération' END AS agglomeration_libelle,
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

-- 6) Véhicules avec un libellé lisible (codes « catv » de l'ONISR, anciens et nouveaux).
CREATE OR REPLACE VIEW accidents_vehicules AS
SELECT
  num_acc,
  num_veh,
  CASE
    WHEN categorie_vehicule IN (1, 80)                               THEN 'vélo'
    WHEN categorie_vehicule IN (50, 60)                              THEN 'trottinette ou engin personnel'
    WHEN categorie_vehicule IN (2, 30, 41)                           THEN 'cyclomoteur'
    WHEN categorie_vehicule IN (4, 5, 6, 31, 32, 33, 34, 42, 43)     THEN 'moto ou scooter'
    WHEN categorie_vehicule IN (3, 7, 8, 9)                          THEN 'voiture'
    WHEN categorie_vehicule IN (10, 11, 12)                          THEN 'utilitaire'
    WHEN categorie_vehicule IN (13, 14, 15, 16, 17)                  THEN 'poids lourd'
    WHEN categorie_vehicule IN (18, 37, 38)                          THEN 'bus ou car'
    WHEN categorie_vehicule IN (19, 39, 40)                          THEN 'tramway ou train'
    WHEN categorie_vehicule IN (20, 21)                              THEN 'engin agricole ou spécial'
    WHEN categorie_vehicule IS NULL                                  THEN NULL
    ELSE 'autre véhicule'
  END AS vehicule
FROM read_parquet('data/archive/baac/*-vehicules.parquet', union_by_name = true);

-- 7) Usagers avec des libellés lisibles : rôle, gravité, sexe, âge (année de l'accident − année de naissance)
--    et équipement de sécurité, tels que publiés par l'ONISR.
CREATE OR REPLACE VIEW accidents_usagers_detail AS
SELECT
  u.num_acc,
  u.num_veh,
  CASE u.categorie_usager WHEN 1 THEN 'conducteur' WHEN 2 THEN 'passager' WHEN 3 THEN 'piéton' END AS role,
  CASE u.gravite WHEN 1 THEN 'indemne' WHEN 2 THEN 'tué' WHEN 3 THEN 'blessé hospitalisé' WHEN 4 THEN 'blessé léger' END AS gravite,
  CASE u.sexe WHEN 1 THEN 'homme' WHEN 2 THEN 'femme' END AS sexe,
  CASE WHEN u.annee_naissance IS NOT NULL THEN a.annee - u.annee_naissance END AS age,
  CASE u.equipement
    WHEN 0 THEN 'sans équipement' WHEN 1 THEN 'ceinture' WHEN 2 THEN 'casque' WHEN 3 THEN 'siège enfant'
    WHEN 4 THEN 'gilet réfléchissant' WHEN 5 THEN 'airbag' WHEN 6 THEN 'gants' WHEN 9 THEN 'autre équipement'
  END AS equipement,
  v.vehicule
FROM read_parquet('data/archive/baac/*-usagers.parquet', union_by_name = true) u
JOIN accidents a USING (num_acc)
LEFT JOIN accidents_vehicules v ON v.num_acc = u.num_acc AND v.num_veh = u.num_veh;
