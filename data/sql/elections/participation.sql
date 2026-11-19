-- Extrait archivé : participation à chaque scrutin (1999 → dernier), à Luynes, en Indre-et-Loire et en France entière.
-- Source : résultats agrégés par bureau de vote ({general}, data.gouv.fr). Une ligne par scrutin et par tour.
-- « id_election » ressemble à « 2022_pres_t1 » : année, type de scrutin, tour.
-- Exécuté par scripts/archive-elections.ts → data/archive/elections/participation.parquet
SELECT
  id_election,
  -- Luynes (code INSEE 37139), tous bureaux de vote réunis
  sum(inscrits) FILTER (code_commune = '37139')    AS inscrits_luynes,
  sum(votants)  FILTER (code_commune = '37139')    AS votants_luynes,
  sum(blancs)   FILTER (code_commune = '37139')    AS blancs_luynes,
  sum(nuls)     FILTER (code_commune = '37139')    AS nuls_luynes,
  sum(exprimes) FILTER (code_commune = '37139')    AS exprimes_luynes,
  count(DISTINCT code_bv) FILTER (code_commune = '37139') AS bureaux_luynes,
  -- Indre-et-Loire
  sum(inscrits) FILTER (code_departement = '37')   AS inscrits_37,
  sum(votants)  FILTER (code_departement = '37')   AS votants_37,
  -- France entière (métropole, outre-mer et, selon le scrutin, Français de l'étranger)
  sum(inscrits)                                    AS inscrits_france,
  sum(votants)                                     AS votants_france
FROM read_parquet('{general}')
GROUP BY id_election
HAVING sum(inscrits) FILTER (code_commune = '37139') > 0
ORDER BY id_election;
