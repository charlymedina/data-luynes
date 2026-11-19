-- Qui consomme l'énergie à Luynes ? Électricité + gaz de la dernière année, par secteur, en part du total.
-- Résultat : src/data/generated/energie_secteurs.json (une ligne par secteur).
WITH derniere AS (
  SELECT * FROM ore_luynes WHERE annee = (SELECT max(annee) FROM ore_luynes)
),
par_secteur AS (
  SELECT
    CASE secteur
      WHEN 'RESIDENTIEL' THEN 'Logements'
      WHEN 'TERTIAIRE'   THEN 'Commerces, services, hôpital'
      WHEN 'INDUSTRIE'   THEN 'Industrie'
      WHEN 'AGRICULTURE' THEN 'Agriculture'
      ELSE 'Non classé'
    END                                                     AS secteur,
    sum(mwh)                                                AS mwh
  FROM derniere
  GROUP BY 1
)
SELECT
  (SELECT max(annee) FROM ore_luynes)                       AS annee,
  secteur,
  round(mwh, 0)::INTEGER                                    AS mwh,
  round(100 * mwh / sum(mwh) OVER (), 1)::DOUBLE            AS part_pct
FROM par_secteur
WHERE mwh > 0
ORDER BY mwh DESC;
