-- Vues partagées du thème « Élections » (utilisées par les requêtes elections_*.sql).
-- L'historique vient de l'archive data/archive/elections/ (voir scripts/archive-elections.ts et data/sql/elections/).

-- Chaque scrutin et chaque tour, avec la participation à Luynes, en Indre-et-Loire et en France.
-- « id_election » ressemble à « 2022_pres_t1 » : année, type de scrutin, tour.
CREATE OR REPLACE VIEW scrutins AS
WITH p AS (
  SELECT
    *,
    split_part(id_election, '_', 2) AS code_type
  FROM read_parquet('data/archive/elections/participation.parquet')
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
  100.0 * votants_37 / inscrits_37                            AS participation_37,
  100.0 * votants_france / inscrits_france                    AS participation_france
FROM p;

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
