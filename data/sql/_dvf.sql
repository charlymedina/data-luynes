-- Vues partagées « Immobilier » : les ventes immobilières (DVF géolocalisées) d'Indre-et-Loire.
-- Ne produit pas de fichier ; utilisé par les requêtes immobilier_*.sql.
--
-- Dans DVF, une vente (« mutation ») occupe souvent plusieurs lignes : une par parcelle, par local (maison,
-- dépendance…) et par nature de terrain, et le prix total (valeur_fonciere) est répété sur chaque ligne.
-- On regroupe donc tout par id_mutation pour obtenir UNE ligne par vente.

-- 1. Lignes brutes, tous les fichiers annuels, colonnes utiles converties dans le bon type
CREATE OR REPLACE TABLE dvf_lignes AS
SELECT
  id_mutation,
  date_mutation::DATE                        AS date_vente,
  valeur_fonciere::DOUBLE                    AS prix,
  code_commune,
  adresse_nom_voie                           AS rue,
  id_parcelle,
  lot1_numero,
  type_local,
  surface_reelle_bati::DOUBLE                AS surface_bati,
  nombre_pieces_principales::INTEGER         AS pieces,
  nature_culture,
  surface_terrain::DOUBLE                    AS surface_terrain,
  longitude::DOUBLE                          AS lon,
  latitude::DOUBLE                           AS lat
FROM read_csv('data/raw/dvf_37/*.csv.gz', union_by_name = true, all_varchar = true)
-- Les ventes classiques et les ventes sur plan (VEFA) ; on écarte échanges, adjudications et expropriations
WHERE nature_mutation IN ('Vente', 'Vente en l''état futur d''achèvement');

-- 2. Une ligne par vente
CREATE OR REPLACE TABLE dvf_ventes AS
WITH
-- Les locaux de chaque vente, sans doublon (une maison apparaît une fois par nature de terrain)
locaux AS (
  SELECT DISTINCT id_mutation, id_parcelle, lot1_numero, type_local, surface_bati, pieces
  FROM dvf_lignes
  WHERE type_local IS NOT NULL
),
compte_locaux AS (
  SELECT
    id_mutation,
    count(*) FILTER (type_local = 'Maison')                AS nb_maisons,
    count(*) FILTER (type_local = 'Appartement')           AS nb_appartements,
    count(*) FILTER (type_local LIKE 'Local industriel%')   AS nb_locaux_activite,
    sum(surface_bati) FILTER (type_local IN ('Maison', 'Appartement')) AS surface_bati,
    sum(pieces)       FILTER (type_local IN ('Maison', 'Appartement')) AS pieces
  FROM locaux
  GROUP BY id_mutation
),
-- Les terrains de chaque vente, sans doublon (une parcelle apparaît une fois par local)
terrains AS (
  SELECT id_mutation, sum(surface_terrain) AS surface_terrain
  FROM (SELECT DISTINCT id_mutation, id_parcelle, nature_culture, surface_terrain FROM dvf_lignes WHERE surface_terrain > 0)
  GROUP BY id_mutation
),
ventes AS (
  SELECT
    id_mutation,
    any_value(date_vente)   AS date_vente,
    any_value(prix)         AS prix,
    any_value(code_commune) AS code_commune,
    mode(rue)               AS rue,          -- la rue la plus citée dans les lignes de la vente
    avg(lon)                AS lon,          -- centre des parcelles vendues
    avg(lat)                AS lat
  FROM dvf_lignes
  GROUP BY id_mutation
)
SELECT
  v.*,
  coalesce(l.nb_maisons, 0)          AS nb_maisons,
  coalesce(l.nb_appartements, 0)     AS nb_appartements,
  coalesce(l.nb_locaux_activite, 0)  AS nb_locaux_activite,
  l.surface_bati,
  l.pieces,
  t.surface_terrain,
  -- Type de bien, du point de vue d'un acheteur
  CASE
    WHEN coalesce(l.nb_maisons, 0) = 1 AND coalesce(l.nb_appartements, 0) = 0 AND coalesce(l.nb_locaux_activite, 0) = 0 THEN 'Maison'
    WHEN coalesce(l.nb_appartements, 0) = 1 AND coalesce(l.nb_maisons, 0) = 0 AND coalesce(l.nb_locaux_activite, 0) = 0 THEN 'Appartement'
    WHEN l.id_mutation IS NULL THEN 'Terrain'   -- aucun bâtiment : terrain à bâtir, jardin, champ, bois…
    ELSE 'Autre'                                -- plusieurs logements, local commercial, dépendance seule…
  END AS type_bien
FROM ventes v
LEFT JOIN compte_locaux l USING (id_mutation)
LEFT JOIN terrains t USING (id_mutation);

-- 3. Prix au m² des ventes « simples » (une seule maison ou un seul appartement), valeurs aberrantes écartées
CREATE OR REPLACE VIEW dvf_ventes_prix AS
SELECT
  *,
  CASE
    WHEN type_bien IN ('Maison', 'Appartement')
     AND surface_bati >= 15                         -- moins de 15 m² : surface probablement mal saisie
     AND prix / surface_bati BETWEEN 300 AND 15000  -- hors de cette fourchette : vente atypique (familiale, lot partiel…)
    THEN prix / surface_bati
  END AS prix_m2
FROM dvf_ventes
WHERE prix >= 1000;   -- ventes symboliques (1 €, quelques centaines d'euros) écartées
