-- Vue partagée « âge du bâti » (fichier « _ » : exécuté en premier, ne produit pas de JSON).
-- (Le nom commence par « _spatial_ » et se classe après _spatial_nature.sql, qui définit la forme de la commune.)
-- BD TOPO (IGN) : chaque bâtiment est téléchargé dans un rectangle autour de Luynes, puis on ne garde que ceux dont
-- un point intérieur tombe dans le contour exact de la commune (un bâtiment à cheval sur la limite compte une seule fois).
--
-- Attention à l'attribut « date d'apparition » : c'est une date de construction ESTIMÉE (issue surtout du cadastre et
-- des fichiers fonciers), souvent arrondie (1450, 1800, 1850…) et absente pour beaucoup de bâtiments (annexes, hangars…).
-- La page l'indique : les chiffres de dates ne portent que sur les bâtiments datés.
CREATE OR REPLACE VIEW bati_batiments AS
WITH brutes AS (
  SELECT
    f.properties.usage_1                                      AS usage_principal,
    f.properties.usage_2                                      AS usage_secondaire,
    f.properties.nature                                       AS nature,
    f.properties.etat_de_l_objet                              AS etat,
    f.properties.hauteur::DOUBLE                              AS hauteur,
    -- « 1830-01-01Z » → 1830 (seule l'année compte)
    left(f.properties.date_d_apparition, 4)::INTEGER          AS annee_apparition,
    ST_MakeValid(ST_GeomFromGeoJSON(to_json(f.geometry)))     AS geom
  FROM (SELECT unnest(data) AS f FROM read_json('data/raw/bdtopo_batiments.json', maximum_object_size = 100000000))
)
SELECT
  b.usage_principal, b.usage_secondaire, b.nature, b.hauteur, b.annee_apparition,
  -- « résidentiel » : bâtiment dont l'usage principal ou secondaire est l'habitation
  (b.usage_principal = 'Résidentiel' OR b.usage_secondaire = 'Résidentiel') AS residentiel
FROM brutes b, nature_commune c
WHERE b.etat = 'En service'
  AND ST_Intersects(ST_PointOnSurface(b.geom), c.geom);
