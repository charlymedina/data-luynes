-- Participation (votants sur 100 inscrits) à chaque scrutin depuis 1999 : Luynes, Indre-et-Loire, France.
-- Résultat : src/data/generated/elections_participation.json (une ligne par scrutin et par tour).
SELECT
  id_election,
  annee,
  tour,
  famille,
  type,
  inscrits_luynes::INTEGER                AS inscrits,
  votants_luynes::INTEGER                 AS votants,
  bureaux_luynes::INTEGER                 AS bureaux,
  round(participation_luynes, 1)::DOUBLE  AS participation_luynes,
  round(participation_37, 1)::DOUBLE      AS participation_37,
  round(participation_france, 1)::DOUBLE  AS participation_france
FROM scrutins
ORDER BY annee, famille, tour;
