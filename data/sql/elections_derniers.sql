-- Dernier scrutin de chaque type (1er tour) : participation à Luynes, en Indre-et-Loire, en France,
-- et rang de Luynes parmi les communes d'Indre-et-Loire (rang 1 = la participation la plus forte).
-- Résultat : src/data/generated/elections_derniers.json (une ligne par type de scrutin).
WITH classement AS (
  SELECT
    id_election,
    code_commune,
    rank() OVER (PARTITION BY id_election ORDER BY participation DESC) AS rang,
    count(*) OVER (PARTITION BY id_election)                          AS nb_communes
  FROM participation_communes_37
  WHERE id_election IN (SELECT id_election FROM derniers_scrutins)
)

SELECT
  d.id_election,
  d.famille,
  d.type,
  d.annee,
  d.inscrits_luynes::INTEGER              AS inscrits,
  round(d.participation_luynes, 1)::DOUBLE AS participation_luynes,
  round(d.participation_37, 1)::DOUBLE     AS participation_37,
  round(d.participation_france, 1)::DOUBLE AS participation_france,
  c.rang::INTEGER                          AS rang,
  c.nb_communes::INTEGER                   AS nb_communes
FROM derniers_scrutins d
JOIN classement c ON c.id_election = d.id_election AND c.code_commune = '37139'
-- Ordre d'affichage : du scrutin le plus « national » au plus local
ORDER BY CASE d.famille WHEN 'pres' THEN 1 WHEN 'legi' THEN 2 WHEN 'euro' THEN 3 WHEN 'muni' THEN 4 WHEN 'regi' THEN 5 ELSE 6 END;
