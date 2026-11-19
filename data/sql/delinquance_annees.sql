-- Délinquance enregistrée à Luynes, année par année, pour chaque indicateur retenu.
-- « nombre » est vide quand le SSMSI ne publie pas la valeur (secret statistique : moins de 5 faits sur 3 ans).
-- Résultat : src/data/generated/delinquance_annees.json (une ligne par indicateur et par année)
SELECT
  r.indicateur,
  r.libelle,
  l.annee,
  l.nombre::INTEGER   AS nombre,
  l.diffuse
FROM delinquance_indicateurs_retenus r
JOIN delinquance_luynes l USING (indicateur)
ORDER BY r.ordre, l.annee;
