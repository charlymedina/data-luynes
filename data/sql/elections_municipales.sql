-- Municipales 2026 à Luynes : chaque liste, ses voix aux deux tours et les sièges obtenus
-- au conseil municipal (CM) et au conseil communautaire de Tours Métropole (CC).
-- Les fichiers officiels sont « larges » : une série de colonnes par liste (« Voix 1 », « Voix 2 »…).
-- On les « déplie » ici en une ligne par liste (numéros de liste 1 à 40).
-- Résultat : src/data/generated/elections_municipales.json
WITH lignes AS (
  SELECT 1 AS tour, to_json(r) AS j FROM (SELECT unnest(data) AS r FROM read_json('data/raw/municipales_2026_t1.json'))
  UNION ALL
  SELECT 2 AS tour, to_json(r) AS j FROM (SELECT unnest(data) AS r FROM read_json('data/raw/municipales_2026_t2.json'))
),

-- Une ligne par liste et par tour (la colonne « i » parcourt les numéros 1 à 40 des colonnes larges)
listes AS (
  SELECT
    tour,
    json_extract_string(j, '$."Numéro de panneau ' || i || '"')::INTEGER AS panneau,
    json_extract_string(j, '$."Libellé de liste ' || i || '"')           AS liste,
    nullif(trim(concat_ws(' ',
      json_extract_string(j, '$."Prénom candidat ' || i || '"'),
      json_extract_string(j, '$."Nom candidat ' || i || '"'))), '')      AS tete_de_liste,
    json_extract_string(j, '$."Voix ' || i || '"')::INTEGER              AS voix,
    json_extract_string(j, '$."Exprimés"')::INTEGER                       AS exprimes,
    json_extract_string(j, '$."Sièges au CM ' || i || '"')::INTEGER      AS sieges_cm,
    json_extract_string(j, '$."Sièges au CC ' || i || '"')::INTEGER      AS sieges_cc
  FROM lignes, range(1, 41) AS t(i)
),

par_liste AS (
  SELECT
    panneau,
    any_value(liste)                                        AS liste,
    -- La tête de liste est indiquée au 2nd tour (ou au 1er si l'élection s'est jouée au 1er tour)
    coalesce(any_value(tete_de_liste) FILTER (tour = 2), any_value(tete_de_liste)) AS tete_de_liste,
    any_value(voix) FILTER (tour = 1)                       AS voix_t1,
    any_value(100.0 * voix / exprimes) FILTER (tour = 1)    AS part_t1,
    any_value(voix) FILTER (tour = 2)                       AS voix_t2,
    any_value(100.0 * voix / exprimes) FILTER (tour = 2)    AS part_t2,
    -- Les sièges sont attribués au tour décisif : on garde le total le plus élevé des deux tours
    max(sieges_cm)                                          AS sieges_cm,
    max(sieges_cc)                                          AS sieges_cc
  FROM listes
  WHERE panneau IS NOT NULL
  GROUP BY panneau
)

SELECT
  panneau,
  liste,
  tete_de_liste,
  voix_t1::INTEGER                     AS voix_t1,
  round(part_t1, 1)::DOUBLE            AS part_t1,
  voix_t2::INTEGER                     AS voix_t2,
  round(part_t2, 1)::DOUBLE            AS part_t2,
  coalesce(sieges_cm, 0)::INTEGER      AS sieges_cm,
  coalesce(sieges_cc, 0)::INTEGER      AS sieges_cc
FROM par_liste
ORDER BY coalesce(voix_t2, voix_t1) DESC;
