-- Vues partagées du thème « Construction & logement social » (fichier « _ » : exécuté en premier, sans JSON).
-- Sources : Sitadel (logements autorisés / commencés, SDES) et RPLS (logements sociaux, SDES).

-- 1) Sitadel : un mois par ligne. « Tous Logements » = total ; « Collectif » = appartements.
--    Les dates sont celles de prise en compte administrative du permis ou du chantier (pas la date réelle).
CREATE OR REPLACE VIEW sitadel AS
SELECT
  ANNEE::INTEGER                  AS annee,
  MOIS::INTEGER                   AS mois,
  TYPE_LGT                        AS type_logement,
  coalesce(LOG_AUT, 0)::INTEGER   AS autorises,
  coalesce(LOG_COM, 0)::INTEGER   AS commences
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/sitadel_luynes.json'));

-- 2) Années complètes (12 mois publiés) : la dernière année en cours n'est pas comparée aux autres
CREATE OR REPLACE VIEW sitadel_annees_completes AS
SELECT annee FROM sitadel WHERE type_logement = 'Tous Logements' GROUP BY annee HAVING count(DISTINCT mois) = 12;

-- 3) RPLS : un logement social par ligne
CREATE OR REPLACE VIEW logements_sociaux AS
SELECT
  try_cast(NBPIECE AS INTEGER)    AS pieces,
  try_cast(SURFHAB AS DOUBLE)     AS surface,
  try_cast(CONSTRUCT AS INTEGER)  AS annee_construction,
  nullif(trim(DPEENERGIE), '')    AS dpe,
  TYPECONST_LIBELLE               AS type_construction
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/rpls_luynes.json'));
