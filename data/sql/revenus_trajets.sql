-- Comment et où vont travailler les Luynois en emploi ? (dernier recensement, en % des actifs en emploi)
-- Résultat : src/data/generated/revenus_trajets.json (une ligne).
WITH luynes AS (
  SELECT * FROM navettes
  WHERE territoire = 'Luynes' AND annee = (SELECT max(annee) FROM navettes)
),
total AS (
  SELECT actifs FROM luynes WHERE lieu_travail = '_T' AND transport = '_T'
)
SELECT
  round((SELECT actifs FROM total))::INTEGER AS actifs_en_emploi,
  -- Moyen de transport principal (4 groupes)
  round(100 * sum(actifs) FILTER (lieu_travail = '_T' AND transport = '5') / (SELECT actifs FROM total), 1)::DOUBLE              AS voiture,
  round(100 * sum(actifs) FILTER (lieu_travail = '_T' AND transport = '6') / (SELECT actifs FROM total), 1)::DOUBLE              AS transports_en_commun,
  round(100 * sum(actifs) FILTER (lieu_travail = '_T' AND transport IN ('2', '3', '4')) / (SELECT actifs FROM total), 1)::DOUBLE AS marche_velo_deux_roues,
  round(100 * sum(actifs) FILTER (lieu_travail = '_T' AND transport = '1') / (SELECT actifs FROM total), 1)::DOUBLE              AS sans_trajet,
  -- Lieu de travail
  round(100 * sum(actifs) FILTER (lieu_travail = '10' AND transport = '_T') / (SELECT actifs FROM total), 1)::DOUBLE             AS dans_la_commune,
  round(100 * sum(actifs) FILTER (lieu_travail = '21' AND transport = '_T') / (SELECT actifs FROM total), 1)::DOUBLE             AS ailleurs_dans_le_37,
  round(100 * sum(actifs) FILTER (lieu_travail IN ('22', '23', '24T30') AND transport = '_T') / (SELECT actifs FROM total), 1)::DOUBLE AS hors_departement
FROM luynes;
