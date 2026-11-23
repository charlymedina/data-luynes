-- Répartition des constructions par période, deux regards sur le même découpage (celui du recensement de l'INSEE) :
--  1) les bâtiments d'habitation DATÉS de la BD TOPO (IGN), au contour exact de la commune ;
--  2) les résidences principales du recensement (INSEE), pour Luynes, l'Indre-et-Loire et la France.
-- Les bornes des périodes sont lues dans les codes INSEE (« Y1919T1945 » = de 1919 à 1945 ; « Y_LT1919 » = avant 1919 ;
-- « Y2006TAAAA » = 2006 ou après) : elles suivent donc le découpage du recensement, sans année écrite à la main ici.
-- Limite : la date d'apparition de la BD TOPO s'arrête vers 2016 et manque pour une part des bâtiments ; la dernière
-- période est donc sous-estimée dans la BD TOPO, mais complète dans le recensement.
-- Résultat : src/data/generated/patrimoine_bati_periodes.json (une ligne par période, de la plus ancienne à la plus récente).
WITH
dernier_recensement AS (SELECT max(annee) AS annee FROM residences_principales),

-- Périodes du dernier recensement : les tranches « de … à … » + la tranche « avant … » la plus ancienne
-- (l'INSEE publie aussi des cumuls « avant 2021 », « avant 2015 »… qu'on ne garde pas).
codes AS (
  SELECT DISTINCT periode FROM residences_principales
  WHERE annee = (SELECT annee FROM dernier_recensement)
    AND (regexp_matches(periode, '^Y\d{4}T') OR periode = (
      SELECT min(periode) FROM residences_principales
      WHERE annee = (SELECT annee FROM dernier_recensement) AND periode LIKE 'Y\_LT%' ESCAPE '\'
    ))
),
periodes AS (
  SELECT
    periode,
    coalesce(try_cast(regexp_extract(periode, '^Y(\d{4})T', 1) AS INTEGER), 0)                       AS debut,
    CASE
      WHEN periode LIKE 'Y\_LT%' ESCAPE '\' THEN regexp_extract(periode, 'LT(\d{4})', 1)::INTEGER - 1
      WHEN periode LIKE '%TAAAA'            THEN 9999
      ELSE regexp_extract(periode, 'T(\d{4})$', 1)::INTEGER
    END                                                                                            AS fin
  FROM codes
),
libelles AS (
  SELECT *, row_number() OVER (ORDER BY debut) AS ordre,
    CASE
      WHEN debut = 0    THEN 'Avant ' || (fin + 1)
      WHEN fin = 9999   THEN debut || ' ou après'
      ELSE debut || '-' || fin
    END AS libelle
  FROM periodes
),

-- 1) BD TOPO : bâtiments d'habitation datés, rangés dans la période de leur année d'apparition
bdtopo AS (
  SELECT l.periode, count(*) AS batiments
  FROM bati_batiments b JOIN libelles l ON b.annee_apparition BETWEEN l.debut AND l.fin
  WHERE b.residentiel
  GROUP BY l.periode
),
total_bdtopo AS (SELECT sum(batiments) AS total FROM bdtopo),

-- 2) INSEE : résidences principales par période (la part se calcule sur le total des périodes retenues)
insee AS (
  SELECT r.territoire, r.periode, r.logements,
         100 * r.logements / sum(r.logements) OVER (PARTITION BY r.territoire) AS part
  FROM residences_principales r
  WHERE r.annee = (SELECT annee FROM dernier_recensement) AND r.periode IN (SELECT periode FROM codes)
)

SELECT
  l.ordre::INTEGER                                                                   AS ordre,
  l.libelle                                                                          AS periode,
  coalesce(b.batiments, 0)::INTEGER                                                  AS batiments,
  round(100.0 * coalesce(b.batiments, 0) / (SELECT total FROM total_bdtopo), 1)::DOUBLE AS part_batiments_pct,
  round(max(i.logements) FILTER (i.territoire = 'Luynes'))::INTEGER                  AS logements,
  round(max(i.part) FILTER (i.territoire = 'Luynes'), 1)::DOUBLE                     AS part_logements_pct,
  round(max(i.part) FILTER (i.territoire = 'Indre-et-Loire'), 1)::DOUBLE             AS part_logements_37_pct,
  round(max(i.part) FILTER (i.territoire = 'France'), 1)::DOUBLE                     AS part_logements_france_pct,
  (SELECT annee FROM dernier_recensement)::INTEGER                                   AS annee_recensement
FROM libelles l
LEFT JOIN bdtopo b ON b.periode = l.periode
LEFT JOIN insee i ON i.periode = l.periode
GROUP BY l.ordre, l.libelle, b.batiments
ORDER BY l.ordre;
