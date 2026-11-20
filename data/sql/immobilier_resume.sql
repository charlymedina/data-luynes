-- Chiffres clés « Immobilier » de Luynes et classement parmi les communes d'Indre-et-Loire.
-- - Nombre de ventes : toutes les années disponibles (fichiers publiés + archive du site).
-- - Prix (médianes, classement, département) : les 5 dernières années seulement (vue dvf_ventes_prix_recentes),
--   pour décrire le marché actuel.
-- Classement : seulement les communes avec au moins 30 ventes de maisons sur la fenêtre de prix (sinon la
-- médiane d'une petite commune dépend de 2 ou 3 ventes et le classement n'a pas de sens).
-- Rang 1 = la commune où le m² de maison est le plus cher.
-- Résultat : src/data/generated/immobilier_resume.json (une ligne).
WITH par_commune AS (
  SELECT
    code_commune,
    count(*) FILTER (type_bien = 'Maison' AND prix_m2 IS NOT NULL) AS ventes_maisons,
    median(prix_m2) FILTER (type_bien = 'Maison')                  AS prix_m2_maison
  FROM dvf_ventes_prix_recentes
  GROUP BY code_commune
),
classement AS (
  SELECT
    code_commune,
    prix_m2_maison,
    rank() OVER (ORDER BY prix_m2_maison DESC) AS rang,
    count(*) OVER ()                           AS nb_communes_classees
  FROM par_commune
  WHERE ventes_maisons >= 30
),
-- Toutes les ventes de Luynes (toutes années)
luynes_ventes AS (
  SELECT
    min(date_vente)                                   AS premiere_vente,
    max(date_vente)                                   AS derniere_vente,
    count(*)                                          AS ventes,
    count(*) FILTER (type_bien = 'Maison')            AS ventes_maisons,
    count(*) FILTER (type_bien = 'Appartement')       AS ventes_appartements,
    count(*) FILTER (type_bien = 'Terrain')           AS ventes_terrains,
    count(*) FILTER (type_bien = 'Autre')             AS ventes_autres,
    count(*) FILTER (lat IS NOT NULL AND lon IS NOT NULL) AS ventes_geolocalisees,
    max(prix) FILTER (type_bien = 'Maison')           AS maison_la_plus_chere,
    sum(prix)                                         AS montant_total
  FROM dvf_ventes_prix
  WHERE code_commune = '37139'
),
-- Prix de Luynes sur la fenêtre des 5 dernières années
luynes_prix AS (
  SELECT
    min(year(date_vente))                             AS annee_debut_prix,
    median(prix_m2) FILTER (type_bien = 'Maison')     AS prix_m2_maison,
    median(prix_m2) FILTER (type_bien = 'Appartement') AS prix_m2_appartement,
    median(prix) FILTER (type_bien = 'Maison')        AS prix_maison,
    median(surface_bati) FILTER (type_bien = 'Maison') AS surface_maison,
    median(surface_terrain) FILTER (type_bien = 'Maison') AS terrain_maison
  FROM dvf_ventes_prix_recentes
  WHERE code_commune = '37139'
),
departement AS (
  SELECT
    median(prix_m2) FILTER (type_bien = 'Maison') AS prix_m2_maison_37,
    median(prix)    FILTER (type_bien = 'Maison') AS prix_maison_37
  FROM dvf_ventes_prix_recentes
)
SELECT
  strftime(v.premiere_vente, '%Y-%m-%d')   AS premiere_vente,
  strftime(v.derniere_vente, '%Y-%m-%d')   AS derniere_vente,
  year(v.premiere_vente)::INTEGER          AS annee_debut,
  year(v.derniere_vente)::INTEGER          AS annee_fin,
  p.annee_debut_prix::INTEGER              AS annee_debut_prix,
  v.ventes::INTEGER                        AS ventes,
  v.ventes_maisons::INTEGER                AS ventes_maisons,
  v.ventes_appartements::INTEGER           AS ventes_appartements,
  v.ventes_terrains::INTEGER               AS ventes_terrains,
  v.ventes_autres::INTEGER                 AS ventes_autres,
  v.ventes_geolocalisees::INTEGER          AS ventes_geolocalisees,
  round(p.prix_m2_maison)::INTEGER         AS prix_m2_maison,
  round(p.prix_m2_appartement)::INTEGER    AS prix_m2_appartement,
  round(p.prix_maison)::INTEGER            AS prix_maison,
  round(p.surface_maison)::INTEGER         AS surface_maison,
  round(p.terrain_maison)::INTEGER         AS terrain_maison,
  round(v.maison_la_plus_chere)::INTEGER   AS maison_la_plus_chere,
  round(v.montant_total)::DOUBLE           AS montant_total,
  round(d.prix_m2_maison_37)::INTEGER      AS prix_m2_maison_37,
  round(d.prix_maison_37)::INTEGER         AS prix_maison_37,
  c.rang::INTEGER                          AS rang_prix_m2_maison,
  c.nb_communes_classees::INTEGER          AS nb_communes_classees
FROM luynes_ventes v, luynes_prix p, departement d, classement c
WHERE c.code_commune = '37139';
