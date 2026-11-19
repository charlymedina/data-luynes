-- Que font les 15-64 ans ? Répartition en 4 situations au dernier recensement, pour Luynes,
-- l'Indre-et-Loire et la France (en % des 15-64 ans).
-- Résultat : src/data/generated/revenus_activite.json (une ligne par territoire).
WITH dernier AS (
  SELECT * FROM activite WHERE annee = (SELECT max(annee) FROM activite)
)
SELECT
  territoire,
  round(100 * sum(personnes) FILTER (statut = '1')  / sum(personnes) FILTER (statut = '_T'), 1)::DOUBLE AS en_emploi,
  round(100 * sum(personnes) FILTER (statut = '2')  / sum(personnes) FILTER (statut = '_T'), 1)::DOUBLE AS chomage,
  round(100 * sum(personnes) FILTER (statut = '33') / sum(personnes) FILTER (statut = '_T'), 1)::DOUBLE AS etudes,
  -- Retraités, personnes au foyer et autres inactifs
  round(100 * sum(personnes) FILTER (statut IN ('31', '35T36')) / sum(personnes) FILTER (statut = '_T'), 1)::DOUBLE AS retraite_autres
FROM dernier
GROUP BY territoire
ORDER BY CASE territoire WHEN 'Luynes' THEN 1 WHEN 'Indre-et-Loire' THEN 2 ELSE 3 END;
