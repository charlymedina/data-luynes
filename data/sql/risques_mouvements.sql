-- Mouvements de terrain recensés à Luynes (Géorisques / BRGM) : éboulements, glissements, effondrements.
-- On garde le type et l'année ; les adresses ne sont pas reprises (souvent des propriétés privées).
-- Résultat : src/data/generated/risques_mouvements.json (du plus ancien au plus récent).
WITH mouvements AS (
  SELECT unnest(data) AS m FROM read_json('data/raw/mouvements_terrain_luynes.json')
)

SELECT
  year(m.date_debut::DATE)::INTEGER AS annee,
  CASE
    WHEN m.type ILIKE 'Chute de blocs%'  THEN 'Chute de blocs / éboulement'
    WHEN m.type ILIKE 'Effondrement%'    THEN 'Effondrement / affaissement'
    ELSE m.type
  END                       AS type
FROM mouvements
WHERE m.date_debut IS NOT NULL
ORDER BY annee;
