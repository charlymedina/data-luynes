-- Vue partagée « PPRi » (fichier « _ » : exécuté en premier, ne produit pas de JSON).
-- (Le nom se classe après _spatial_nature.sql, qui définit la forme de la commune : nature_commune.)
-- Plan de prévention du risque d'inondation (PPRi) de la Loire, Val de Tours – Val de Luynes (DDT d'Indre-et-Loire).
-- Chaque zone réglementaire du plan est découpée à la limite exacte de Luynes. Le code de zone se lit ainsi :
--   A = zone non urbanisée (ou lit de la Loire) : on y évite de construire ; B ou C = zone déjà urbanisée (C : centre urbain),
--   où l'on peut construire sous conditions ; EM = lit mineur et lit endigué ; ZDE = zone de dissipation de l'énergie
--   (derrière les digues) ; TF+, TF, F, M = niveau d'aléa (très fort fréquent, très fort, fort, modéré).
-- On regroupe en 4 types lisibles pour la carte (le détail par code reste dans le plan officiel).
-- Les surfaces sont calculées en Lambert 93 (EPSG:2154), la projection officielle en mètres pour la France.
CREATE OR REPLACE VIEW ppri_zones_commune AS
WITH zones AS (
  SELECT
    CODEZONE AS code,
    CASE
      WHEN CODEZONE = 'A EM'  THEN 1   -- lit de la Loire (lit mineur et lit endigué)
      WHEN CODEZONE = 'A ZDE' THEN 2   -- derrière les digues, là où l'eau arriverait avec force en cas de rupture
      WHEN CODEZONE LIKE 'A %' THEN 3  -- non urbanisé, l'eau peut s'étaler (champ d'expansion des crues)
      ELSE 4                           -- déjà urbanisé (B, C) : constructible sous conditions
    END AS type_ordre,
    regexp_extract(NOMFIC, '_(\d{8})\.pdf$', 1) AS date_reglement,
    ST_MakeValid(geometry) AS geom
  FROM ST_Read('data/raw/ppri_zones/zones.gml')
),
decoupees AS (
  SELECT z.code, z.type_ordre, z.date_reglement, ST_CollectionExtract(ST_Intersection(z.geom, c.geom), 3) AS geom
  FROM zones z, nature_commune c
  WHERE ST_Intersects(z.geom, c.geom)
)
SELECT code, type_ordre, date_reglement, geom
FROM decoupees
WHERE NOT ST_IsEmpty(geom);
