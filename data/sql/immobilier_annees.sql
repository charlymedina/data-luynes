-- Le marché immobilier de Luynes année par année, comparé à l'Indre-et-Loire.
-- Prix au m² : ventes d'une seule maison seulement (les appartements sont trop rares à Luynes pour une
-- médiane annuelle fiable). « Médiane » = la moitié des ventes est au-dessus, l'autre moitié en dessous.
-- Résultat : src/data/generated/immobilier_annees.json (une ligne par année).
WITH luynes AS (
  SELECT
    year(date_vente)                                          AS annee,
    count(*)                                                  AS ventes,
    count(*) FILTER (type_bien = 'Maison')                    AS ventes_maisons,
    count(*) FILTER (type_bien = 'Appartement')               AS ventes_appartements,
    count(*) FILTER (type_bien = 'Terrain')                   AS ventes_terrains,
    count(*) FILTER (type_bien = 'Autre')                     AS ventes_autres,
    median(prix_m2) FILTER (type_bien = 'Maison')             AS prix_m2_maison,
    median(prix)    FILTER (type_bien = 'Maison')             AS prix_maison
  FROM dvf_ventes_prix
  WHERE code_commune = '37139'
  GROUP BY ALL
),
departement AS (
  SELECT
    year(date_vente)                              AS annee,
    median(prix_m2) FILTER (type_bien = 'Maison') AS prix_m2_maison_37
  FROM dvf_ventes_prix
  GROUP BY ALL
)
SELECT
  l.annee::INTEGER                    AS annee,
  l.ventes::INTEGER                   AS ventes,
  l.ventes_maisons::INTEGER           AS ventes_maisons,
  l.ventes_appartements::INTEGER      AS ventes_appartements,
  l.ventes_terrains::INTEGER          AS ventes_terrains,
  l.ventes_autres::INTEGER            AS ventes_autres,
  round(l.prix_m2_maison)::INTEGER    AS prix_m2_maison,
  round(d.prix_m2_maison_37)::INTEGER AS prix_m2_maison_37,
  round(l.prix_maison)::INTEGER       AS prix_maison
FROM luynes l
JOIN departement d USING (annee)
ORDER BY annee;
