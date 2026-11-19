-- Répartition des prix de vente des maisons à Luynes, par tranches de 50 000 €, sur toute la période.
-- Les maisons à 500 000 € et plus sont regroupées dans une dernière tranche.
-- Résultat : src/data/generated/immobilier_prix_maisons.json (une ligne par tranche, même vide).
WITH tranches AS (
  SELECT range * 50000 AS debut FROM range(0, 11)   -- 0 €, 50 000 €, … 500 000 €
),
maisons AS (
  SELECT least(floor(prix / 50000) * 50000, 500000) AS debut
  FROM dvf_ventes_prix
  WHERE code_commune = '37139' AND type_bien = 'Maison'
)
SELECT
  t.debut::INTEGER                                   AS debut,
  CASE WHEN t.debut = 500000 THEN NULL ELSE (t.debut + 50000)::INTEGER END AS fin,   -- NULL = « et plus »
  count(m.debut)::INTEGER                            AS ventes
FROM tranches t
LEFT JOIN maisons m ON m.debut = t.debut
GROUP BY t.debut
ORDER BY t.debut;
