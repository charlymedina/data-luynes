-- Équipements sportifs de Luynes regroupés par type (famille du RES ; à défaut, première activité citée).
-- Résultat : src/data/generated/sport_equipements_types.json (une ligne par type, du plus fréquent au moins fréquent)
SELECT
  type,
  count(*)::INTEGER AS nombre,
  count(DISTINCT installation)::INTEGER AS installations
FROM sport_equipements
GROUP BY type
ORDER BY nombre DESC, type;
