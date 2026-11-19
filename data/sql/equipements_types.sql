-- Chaque type d'équipement présent à Luynes (boulangerie, médecin, piscine…), avec sa fréquence
-- pour 10 000 habitants à Luynes et en Indre-et-Loire.
-- Résultat : src/data/generated/equipements_types.json
WITH luynes AS (SELECT type, domaine, nombre FROM bpe WHERE territoire = 'Luynes' AND type <> '_T'),
dep AS (SELECT type, nombre FROM bpe WHERE territoire = 'Indre-et-Loire' AND type <> '_T'),
pop AS (
  SELECT
    max(population) FILTER (territoire = 'Luynes')         AS luynes,
    max(population) FILTER (territoire = 'Indre-et-Loire') AS dep
  FROM populations_equipements
)
SELECT
  l.type                                                  AS code,
  coalesce(t.libelle, l.type)                             AS libelle,
  l.domaine,
  coalesce(d.libelle, l.domaine)                          AS domaine_libelle,
  l.nombre::INTEGER                                       AS nombre,
  round(10000 * l.nombre / (SELECT luynes FROM pop), 1)::DOUBLE      AS pour_10000_luynes,
  round(10000 * coalesce(x.nombre, 0) / (SELECT dep FROM pop), 1)::DOUBLE AS pour_10000_37
FROM luynes l
LEFT JOIN dep x USING (type)
LEFT JOIN bpe_libelles t ON t.niveau = 'FACILITY_TYPE' AND t.code = l.type
LEFT JOIN bpe_libelles d ON d.niveau = 'FACILITY_DOM' AND d.code = l.domaine
ORDER BY l.type;
