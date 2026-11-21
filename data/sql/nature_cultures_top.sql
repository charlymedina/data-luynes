-- Les cultures les plus répandues à Luynes (dernière année du RPG), au détail : « Blé tendre d'hiver », « Colza d'hiver »…
-- Résultat : src/data/generated/nature_cultures_top.json (les 8 premières).
SELECT
  coalesce(c.libelle_culture, p.code_culture) AS culture,
  coalesce(any_value(c.libelle_groupe), 'Autres cultures') AS famille,
  round(sum(p.surface_ha), 1)::DOUBLE AS surface_ha
FROM nature_parcelles p
LEFT JOIN nature_cultures_codes c USING (code_culture)
WHERE p.periode = 'recent'
GROUP BY p.code_culture, c.libelle_culture
ORDER BY surface_ha DESC
LIMIT 8;
