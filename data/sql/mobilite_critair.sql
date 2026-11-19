-- Vignettes Crit'Air des voitures particulières au 1er janvier de la dernière année : Luynes et Indre-et-Loire.
-- « E » = électrique (et hydrogène), 1 = essence récente ou hybride, 2 à 5 = de plus en plus polluant,
-- « Non classé » = voitures anciennes (avant 1997 pour l'essence, 2001 pour le diesel).
-- Résultat : src/data/generated/mobilite_critair.json (une ligne par vignette).
WITH annee AS (SELECT max(annee) AS a FROM parc_vp_37),
luynes AS (
  SELECT crit_air, sum(vehicules) AS n FROM parc_luynes WHERE groupe = 'VP' AND annee = (SELECT a FROM annee) GROUP BY 1
),
dep AS (
  SELECT crit_air, sum(vehicules) AS n FROM parc_vp_37 WHERE annee = (SELECT a FROM annee) GROUP BY 1
)
SELECT
  (SELECT a FROM annee)                                         AS annee,
  replace(d.crit_air, 'Crit''Air ', '')                         AS vignette,   -- « E », « 1 » … « 5 », « Non classé »
  coalesce(l.n, 0)::INTEGER                                     AS voitures_luynes,
  round(100 * coalesce(l.n, 0) / sum(l.n) OVER (), 1)::DOUBLE   AS part_luynes,
  round(100 * d.n / sum(d.n) OVER (), 1)::DOUBLE                AS part_37
FROM dep d
LEFT JOIN luynes l USING (crit_air)
WHERE d.n > 0
-- Ordre d'affichage : E, puis 1 à 5, puis « Non classé » et « Inconnu »
ORDER BY CASE WHEN vignette = 'E' THEN 0 ELSE coalesce(try_cast(vignette AS INTEGER), 9) END, vignette;
