-- Résultats du dernier scrutin de chaque type (tous ses tours), présentés de façon neutre :
-- part des voix exprimées de chaque candidat ou liste à Luynes (et en Indre-et-Loire / en France pour la
-- présidentielle et les européennes), dans l'ordre des voix obtenues à Luynes.
-- Pour rester lisible, les candidats ou listes sous 3 % partout (Luynes, département, France) sont regroupés
-- dans une ligne « Autres » (avec leur nombre). Aucune étiquette politique n'est reprise.
-- Résultat : src/data/generated/elections_resultats.json
WITH scrutins_retenus AS (
  -- Tous les tours des derniers scrutins de chaque type
  SELECT s.id_election, s.famille, s.type, s.annee, s.tour
  FROM scrutins s
  JOIN derniers_scrutins d ON d.famille = s.famille AND d.annee = s.annee
),

candidats AS (
  SELECT
    r.*,
    v.no_panneau,
    v.libelle,
    v.voix_luynes,
    v.part_luynes,
    v.part_37,
    v.part_france,
    greatest(v.part_luynes, coalesce(v.part_37, 0), coalesce(v.part_france, 0)) >= 3 AS affiche
  FROM scrutins_retenus r
  JOIN voix_candidats v USING (id_election)
)

-- Candidats ou listes affichés un par un
SELECT
  id_election, famille, type, annee, tour,
  libelle,
  1                                 AS nombre,
  voix_luynes::INTEGER              AS voix_luynes,
  round(part_luynes, 1)::DOUBLE     AS part_luynes,
  round(part_37, 1)::DOUBLE         AS part_37,
  round(part_france, 1)::DOUBLE     AS part_france,
  false                             AS autres
FROM candidats
WHERE affiche

UNION ALL

-- Regroupement « Autres » des petits candidats ou listes
SELECT
  id_election, famille, type, annee, tour,
  'Autres'                          AS libelle,
  count(*)::INTEGER                 AS nombre,
  sum(voix_luynes)::INTEGER         AS voix_luynes,
  round(sum(part_luynes), 1)::DOUBLE AS part_luynes,
  round(sum(part_37), 1)::DOUBLE     AS part_37,
  round(sum(part_france), 1)::DOUBLE AS part_france,
  true                              AS autres
FROM candidats
WHERE NOT affiche
GROUP BY ALL

ORDER BY annee DESC, famille, tour, autres, voix_luynes DESC;
