-- Vues partagées du thème « Élections » (utilisées par les requêtes elections_*.sql).
-- L'historique vient de l'archive data/archive/elections/ (voir scripts/archive-elections.ts et data/sql/elections/).

-- Chaque scrutin et chaque tour, avec la participation à Luynes, en Indre-et-Loire et en France.
-- « id_election » ressemble à « 2022_pres_t1 » : année, type de scrutin, tour.
--
-- Périmètre des références « Indre-et-Loire » et « France » : ce sont les bureaux de vote présents dans le fichier
-- agrégé. Pour certains scrutins anciens, ce fichier est partiel (municipales 2008 : communes de 3 500 habitants et
-- plus seulement). Quand le fichier couvre moins de 80 % des inscrits des autres scrutins des années voisines
-- (± 2 ans), la référence n'est pas comparable à Luynes : elle est laissée vide plutôt qu'affichée fausse.
-- (Exception : les cantonales, où seule la moitié des cantons vote par construction : la comparaison reste juste.)
CREATE OR REPLACE VIEW scrutins AS
WITH p AS (
  SELECT
    *,
    split_part(id_election, '_', 2)               AS code_type,
    split_part(id_election, '_', 1)::INTEGER      AS annee_scrutin
  FROM read_parquet('data/archive/elections/participation.parquet')
),
couverture AS (
  SELECT
    a.id_election,
    a.inscrits_france / max(b.inscrits_france) AS part_inscrits
  FROM p a
  JOIN p b ON abs(b.annee_scrutin - a.annee_scrutin) <= 2 AND b.code_type <> 'cant'
  GROUP BY a.id_election, a.inscrits_france
),
comparables AS (
  SELECT
    p.*,
    p.code_type = 'cant' OR c.part_inscrits >= 0.8 AS reference_comparable
  FROM p
  JOIN couverture c USING (id_election)
)
SELECT
  id_election,
  split_part(id_election, '_', 1)::INTEGER                    AS annee,
  replace(split_part(id_election, '_', 3), 't', '')::INTEGER  AS tour,
  code_type,
  -- Les cantonales (jusqu'en 2011) sont devenues les départementales en 2015 : même assemblée, même famille.
  CASE WHEN code_type IN ('cant', 'dpmt') THEN 'dpmt' ELSE code_type END AS famille,
  CASE code_type
    WHEN 'pres' THEN 'Présidentielle'
    WHEN 'legi' THEN 'Législatives'
    WHEN 'euro' THEN 'Européennes'
    WHEN 'muni' THEN 'Municipales'
    WHEN 'regi' THEN 'Régionales'
    WHEN 'dpmt' THEN 'Départementales'
    WHEN 'cant' THEN 'Cantonales'
  END                                                         AS type,
  inscrits_luynes,
  votants_luynes,
  blancs_luynes,
  nuls_luynes,
  exprimes_luynes,
  bureaux_luynes,
  100.0 * votants_luynes / inscrits_luynes                    AS participation_luynes,
  CASE WHEN reference_comparable THEN 100.0 * votants_37 / inscrits_37 END         AS participation_37,
  CASE WHEN reference_comparable THEN 100.0 * votants_france / inscrits_france END AS participation_france
FROM comparables;

-- Participation de chaque commune d'Indre-et-Loire à chaque scrutin (pour les classements).
CREATE OR REPLACE VIEW participation_communes_37 AS
SELECT
  id_election,
  code_commune,
  100.0 * votants / inscrits AS participation
FROM read_parquet('data/archive/elections/communes_37.parquet')
WHERE inscrits > 0;

-- Dernier scrutin de chaque famille (présidentielle, législatives…), 1er tour.
CREATE OR REPLACE VIEW derniers_scrutins AS
SELECT *
FROM scrutins
WHERE tour = 1
QUALIFY row_number() OVER (PARTITION BY famille ORDER BY annee DESC) = 1;

-- Voix de chaque candidat ou liste, en part des voix (exprimés) à Luynes, en Indre-et-Loire et en France.
-- Les parts départementales et nationales n'existent que pour la présidentielle et les européennes.
CREATE OR REPLACE VIEW voix_candidats AS
SELECT
  id_election,
  no_panneau,
  libelle,
  voix_luynes,
  100.0 * voix_luynes / sum(voix_luynes) OVER (PARTITION BY id_election) AS part_luynes,
  100.0 * voix_37     / sum(voix_37)     OVER (PARTITION BY id_election) AS part_37,
  100.0 * voix_france / sum(voix_france) OVER (PARTITION BY id_election) AS part_france
FROM read_parquet('data/archive/elections/candidats.parquet');
