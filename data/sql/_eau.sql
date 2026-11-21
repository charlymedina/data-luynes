-- Vues partagées du thème « Eau potable » (fichier « _ » : exécuté en premier, ne produit pas de JSON).
-- Source : contrôle sanitaire de l'eau du robinet (ARS), API Hub'eau « qualité de l'eau potable ».
-- Un « prélèvement » = un échantillon d'eau pris un jour donné sur le réseau ; on y mesure plusieurs paramètres.
-- Conformité d'un prélèvement (colonnes conformite_*) : C = conforme, N = non conforme, S = sans objet (pas mesuré).
--   « limites » = seuils sanitaires obligatoires ; « références » = repères de confort (goût, température…).

-- 1) Toutes les analyses de l'eau distribuée à Luynes
CREATE OR REPLACE VIEW eau_analyses AS
SELECT
  code_prelevement,
  CAST(date_prelevement AS TIMESTAMP)::DATE           AS date_prelevement,
  year(CAST(date_prelevement AS TIMESTAMP))::INTEGER  AS annee,
  code_parametre,
  libelle_parametre,
  resultat_numerique,
  libelle_unite,
  conformite_limites_bact_prelevement                 AS bact,
  conformite_limites_pc_prelevement                   AS physico_chimie,
  conformite_references_bact_prelevement              AS ref_bact,
  conformite_references_pc_prelevement                AS ref_physico_chimie,
  nom_distributeur
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/eau_luynes.json', maximum_object_size = 100000000));

-- 2) Un prélèvement par ligne, avec ses conclusions de conformité
CREATE OR REPLACE VIEW eau_prelevements AS
SELECT
  code_prelevement,
  min(date_prelevement) AS date_prelevement,
  min(annee)            AS annee,
  max(bact)             AS bact,
  max(physico_chimie)   AS physico_chimie
FROM eau_analyses
GROUP BY code_prelevement;

-- 3) Mesures du département (nitrates, dureté, E. coli) sur les années récentes, pour comparer
CREATE OR REPLACE VIEW eau_37 AS
SELECT 'nitrates' AS parametre, code_prelevement, code_commune, year(CAST(date_prelevement AS TIMESTAMP))::INTEGER AS annee,
       resultat_numerique, conformite_limites_bact_prelevement AS bact
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/eau_37_nitrates.json', maximum_object_size = 100000000))
UNION ALL
SELECT 'durete', code_prelevement, code_commune, year(CAST(date_prelevement AS TIMESTAMP))::INTEGER, resultat_numerique, conformite_limites_bact_prelevement
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/eau_37_durete.json', maximum_object_size = 100000000))
UNION ALL
SELECT 'bacterio', code_prelevement, code_commune, year(CAST(date_prelevement AS TIMESTAMP))::INTEGER, resultat_numerique, conformite_limites_bact_prelevement
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/eau_37_bacterio.json', maximum_object_size = 100000000));

-- 4) Fenêtre de comparaison : les années couvertes par les fichiers du département
CREATE OR REPLACE VIEW eau_fenetre AS
SELECT min(annee) AS annee_debut, max(annee) AS annee_fin FROM eau_37;

-- 5) Eau PUISÉE sous Luynes (et non distribuée) : volumes prélevés chaque année dans les ouvrages (forages, puits…)
--    situés sur la commune. Source : Banque nationale des prélèvements en eau (BNPE), via Hub'eau « prélèvements ».
--    Un ouvrage a une ligne par année et par usage. Volume en m³. On ne garde que les prélèvements « réalisés » (REA).
CREATE OR REPLACE VIEW eau_pompage AS
SELECT
  code_ouvrage,
  nom_ouvrage,
  annee::INTEGER                                         AS annee,
  CASE code_usage WHEN 'AEP' THEN 'potable'
                  WHEN 'IRR' THEN 'irrigation'
                  ELSE 'autre' END                       AS usage,   -- eau potable / irrigation / autre (industrie…)
  libelle_usage,
  sum(volume)::DOUBLE                                    AS volume_m3
FROM (SELECT unnest(data, recursive := true) FROM read_json('data/raw/eau_pompage_luynes.json', maximum_object_size = 100000000))
WHERE code_commune_insee = '37139' AND code_statut_instruction = 'REA'
GROUP BY ALL;
