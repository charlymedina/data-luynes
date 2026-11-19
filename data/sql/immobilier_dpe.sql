-- Étiquettes énergie (DPE) des logements : Luynes comparée à l'Indre-et-Loire et à la France.
-- Source : ADEME, DPE réalisés depuis juillet 2021 (nouvelle méthode). Attention : seuls les logements
-- vendus, loués ou rénovés ont un DPE, ce n'est donc pas un portrait de TOUS les logements.
-- Résultat : src/data/generated/immobilier_dpe.json (une ligne par étiquette, de A à G).
WITH luynes AS (
  SELECT a.value AS etiquette, a.total AS nb FROM (SELECT unnest(aggs) AS a FROM read_json('data/raw/dpe_luynes.json'))
),
departement AS (
  SELECT a.value AS etiquette, a.total AS nb FROM (SELECT unnest(aggs) AS a FROM read_json('data/raw/dpe_37.json'))
),
france AS (
  SELECT a.value AS etiquette, a.total AS nb FROM (SELECT unnest(aggs) AS a FROM read_json('data/raw/dpe_france.json'))
)
SELECT
  l.etiquette,
  l.nb::INTEGER                                                    AS dpe_luynes,
  round(100 * l.nb / sum(l.nb) OVER (), 1)::DOUBLE                 AS part_luynes,
  round(100 * d.nb / sum(d.nb) OVER (), 1)::DOUBLE                 AS part_37,
  round(100 * f.nb / sum(f.nb) OVER (), 1)::DOUBLE                 AS part_france
FROM luynes l
JOIN departement d USING (etiquette)
JOIN france f USING (etiquette)
WHERE l.etiquette IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')
ORDER BY l.etiquette;
