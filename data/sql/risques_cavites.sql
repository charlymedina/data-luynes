-- Cavités souterraines recensées à Luynes (Géorisques / BRGM) : surtout des caves creusées dans le tuffeau du coteau.
-- Une ligne par cavité, pour la carte. Les noms (« Site_15 »…) ne sont pas repris : seule la position compte.
-- Résultat : src/data/generated/risques_cavites.json
WITH cavites AS (
  SELECT unnest(data) AS c FROM read_json('data/raw/cavites_luynes.json')
)

SELECT
  -- Types BRGM : « cave », « ouvrage civil », « naturelle », « carrière »…
  CASE c.type
    WHEN 'cave'          THEN 'Cave'
    WHEN 'ouvrage civil' THEN 'Ouvrage civil'
    WHEN 'naturelle'     THEN 'Cavité naturelle'
    WHEN 'carrière'      THEN 'Carrière'
    ELSE c.type
  END                       AS type,
  round(c.latitude, 5)      AS latitude,
  round(c.longitude, 5)     AS longitude
FROM cavites
WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL
ORDER BY latitude, longitude;
