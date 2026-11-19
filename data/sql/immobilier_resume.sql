-- Chiffres clés « Immobilier » de Luynes sur toute la période DVF disponible (environ 5 ans),
-- et classement parmi les communes d'Indre-et-Loire.
-- Classement : seulement les communes avec au moins 30 ventes de maisons sur la période (sinon la
-- médiane d'une petite commune dépend de 2 ou 3 ventes et le classement n'a pas de sens).
-- Rang 1 = la commune où le m² de maison est le plus cher.
-- Résultat : src/data/generated/immobilier_resume.json (une ligne).
WITH par_commune AS (
  SELECT
    code_commune,
    count(*) FILTER (type_bien = 'Maison' AND prix_m2 IS NOT NULL) AS ventes_maisons,
    median(prix_m2) FILTER (type_bien = 'Maison')                  AS prix_m2_maison
  FROM dvf_ventes_prix
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
luynes AS (
  SELECT
    min(date_vente)                                   AS premiere_vente,
    max(date_vente)                                   AS derniere_vente,
    count(*)                                          AS ventes,
    count(*) FILTER (type_bien = 'Maison')            AS ventes_maisons,
    count(*) FILTER (type_bien = 'Appartement')       AS ventes_appartements,
    count(*) FILTER (type_bien = 'Terrain')           AS ventes_terrains,
    median(prix_m2) FILTER (type_bien = 'Maison')     AS prix_m2_maison,
    median(prix_m2) FILTER (type_bien = 'Appartement') AS prix_m2_appartement,
    median(prix) FILTER (type_bien = 'Maison')        AS prix_maison,
    median(surface_bati) FILTER (type_bien = 'Maison') AS surface_maison,
    median(surface_terrain) FILTER (type_bien = 'Maison') AS terrain_maison,
    max(prix) FILTER (type_bien = 'Maison')           AS maison_la_plus_chere,
    sum(prix)                                         AS montant_total
  FROM dvf_ventes_prix
  WHERE code_commune = '37139'
),
departement AS (
  SELECT
    median(prix_m2) FILTER (type_bien = 'Maison') AS prix_m2_maison_37,
    median(prix)    FILTER (type_bien = 'Maison') AS prix_maison_37
  FROM dvf_ventes_prix
)
SELECT
  strftime(l.premiere_vente, '%Y-%m-%d')   AS premiere_vente,
  strftime(l.derniere_vente, '%Y-%m-%d')   AS derniere_vente,
  year(l.premiere_vente)::INTEGER          AS annee_debut,
  year(l.derniere_vente)::INTEGER          AS annee_fin,
  l.ventes::INTEGER                        AS ventes,
  l.ventes_maisons::INTEGER                AS ventes_maisons,
  l.ventes_appartements::INTEGER           AS ventes_appartements,
  l.ventes_terrains::INTEGER               AS ventes_terrains,
  round(l.prix_m2_maison)::INTEGER         AS prix_m2_maison,
  round(l.prix_m2_appartement)::INTEGER    AS prix_m2_appartement,
  round(l.prix_maison)::INTEGER            AS prix_maison,
  round(l.surface_maison)::INTEGER         AS surface_maison,
  round(l.terrain_maison)::INTEGER         AS terrain_maison,
  round(l.maison_la_plus_chere)::INTEGER   AS maison_la_plus_chere,
  round(l.montant_total)::DOUBLE           AS montant_total,
  round(d.prix_m2_maison_37)::INTEGER      AS prix_m2_maison_37,
  round(d.prix_maison_37)::INTEGER         AS prix_maison_37,
  c.rang::INTEGER                          AS rang_prix_m2_maison,
  c.nb_communes_classees::INTEGER          AS nb_communes_classees
FROM luynes l, departement d, classement c
WHERE c.code_commune = '37139';
