-- Chiffres clés des objets mobiliers protégés à Luynes.
-- Résultat : src/data/generated/patrimoine_objets_resume.json (une ligne)
SELECT
  count(*)::INTEGER                                        AS objets,
  count(*) FILTER (protection = 'classé')::INTEGER         AS classes,
  count(DISTINCT lieu)::INTEGER                            AS lieux,
  min(siecle)::INTEGER                                     AS siecle_min,
  max(siecle)::INTEGER                                     AS siecle_max,
  min(annee_protection)::INTEGER                           AS premiere_protection,
  max(annee_protection)::INTEGER                           AS derniere_protection,
  -- lieu qui conserve le plus d'objets (en cas d'égalité : ordre alphabétique)
  (SELECT lieu FROM patrimoine_objets GROUP BY lieu ORDER BY count(*) DESC, lieu LIMIT 1) AS lieu_principal,
  (SELECT count(*) FROM patrimoine_objets GROUP BY lieu ORDER BY count(*) DESC, lieu LIMIT 1)::INTEGER AS objets_lieu_principal
FROM patrimoine_objets;
