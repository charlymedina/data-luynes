-- Équipements par grand domaine (services, commerces, enseignement, santé, transports, sport, tourisme) :
-- nombre pour 1 000 habitants à Luynes et en Indre-et-Loire, et rang de Luynes parmi les communes du département.
-- Résultat : src/data/generated/equipements_domaines.json
WITH communes AS (
  -- Totaux par domaine de chaque commune d'Indre-et-Loire (une ligne par commune et par domaine)
  SELECT
    right(o.dimensions.GEO, 5)          AS code,
    o.dimensions.FACILITY_DOM           AS domaine,
    o.dimensions.TIME_PERIOD::INTEGER   AS annee,
    o.measures.OBS_VALUE_NIVEAU.value   AS nombre
  FROM (SELECT unnest(observations) AS o FROM read_json('data/raw/bpe_communes_37.json'))
),
taux AS (
  SELECT
    c.domaine,
    c.code,
    1000 * c.nombre / p.population AS pour_1000,
    rank() OVER (PARTITION BY c.domaine ORDER BY c.nombre / p.population DESC) AS rang,
    count(*) OVER (PARTITION BY c.domaine) AS nb_communes
  FROM communes c
  JOIN communes_37 p USING (code)
  WHERE c.annee = (SELECT max(annee) FROM communes)
),
pop AS (
  SELECT
    max(population) FILTER (territoire = 'Luynes')         AS luynes,
    max(population) FILTER (territoire = 'Indre-et-Loire') AS dep
  FROM populations_equipements
),
domaines AS (
  SELECT
    domaine,
    max(nombre) FILTER (territoire = 'Luynes' AND type = '_T')         AS luynes,
    max(nombre) FILTER (territoire = 'Indre-et-Loire' AND type = '_T') AS dep
  FROM bpe
  WHERE sous_domaine = '_T'
  GROUP BY domaine
)
SELECT
  d.domaine,
  coalesce(l.libelle, d.domaine)                                  AS libelle,
  coalesce(d.luynes, 0)::INTEGER                                  AS nombre,
  round(1000 * coalesce(d.luynes, 0) / (SELECT luynes FROM pop), 1)::DOUBLE AS pour_1000_luynes,
  round(1000 * d.dep / (SELECT dep FROM pop), 1)::DOUBLE          AS pour_1000_37,
  t.rang::INTEGER                                                 AS rang,
  t.nb_communes::INTEGER                                          AS nb_communes
FROM domaines d
LEFT JOIN bpe_libelles l ON l.niveau = 'FACILITY_DOM' AND l.code = d.domaine
LEFT JOIN taux t ON t.domaine = d.domaine AND t.code = '37139'
ORDER BY d.domaine = '_T', d.domaine;
