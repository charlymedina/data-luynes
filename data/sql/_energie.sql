-- Vues partagées du thème « Énergie & mobilité » (fichier « _ » : exécuté en premier, ne produit pas de JSON).

-- 1) Consommation d'énergie de Luynes (Agence ORE) : une ligne par année, filière (électricité / gaz),
--    secteur et catégorie de client. Les lignes « secrétisées » (trop peu de clients) n'ont pas de valeur.
CREATE OR REPLACE VIEW ore_luynes AS
SELECT
  r.annee::INTEGER                  AS annee,
  r.filiere                         AS filiere,            -- « Electricité » ou « Gaz »
  r.code_grand_secteur              AS secteur,            -- RESIDENTIEL, TERTIAIRE, INDUSTRIE, AGRICULTURE, INCONNU
  r.nb_sites                        AS sites,              -- points de livraison (≈ logements pour le résidentiel)
  r.conso_totale_mwh                AS mwh
FROM (SELECT unnest(results) AS r FROM read_json('data/raw/energie_ore_luynes.json'));

-- 2) Même chose pour les 272 communes d'Indre-et-Loire, dernière année seulement.
CREATE OR REPLACE VIEW ore_37 AS
SELECT
  r.code_commune                    AS code,
  r.filiere                         AS filiere,
  r.code_grand_secteur              AS secteur,
  r.nb_sites                        AS sites,
  r.conso_totale_mwh                AS mwh
FROM (SELECT unnest(results) AS r FROM read_json('data/raw/energie_ore_37.json'));

-- 3) Parc de véhicules de Luynes au 1er janvier : le fichier a une colonne par année (PARC_2011 … PARC_2026),
--    qu'on « déplie » en une ligne par année. La motorisation est regroupée en grandes familles.
CREATE OR REPLACE MACRO motorisation(carburant) AS CASE
  WHEN carburant = 'Electrique'                    THEN 'Électrique'
  WHEN carburant IN ('Essence HR', 'Diesel HR')    THEN 'Hybride rechargeable'
  WHEN carburant IN ('Essence HNR', 'Diesel HNR')  THEN 'Hybride'
  WHEN carburant = 'Essence'                       THEN 'Essence'
  WHEN carburant = 'Diesel'                        THEN 'Diesel'
  ELSE 'Gaz et autres'
END;

CREATE OR REPLACE VIEW parc_luynes AS
SELECT
  GROUPE                                         AS groupe,      -- VP = voitures particulières, VUL = utilitaires, PL = poids lourds
  motorisation(CARBURANT)                        AS motorisation,
  CRIT_AIR                                       AS crit_air,
  replace(colonne, 'PARC_', '')::INTEGER         AS annee,
  vehicules
FROM (UNPIVOT read_json('data/raw/parc_vehicules_luynes.json') ON COLUMNS('^PARC_') INTO NAME colonne VALUE vehicules);

-- 4) Voitures particulières de chaque commune d'Indre-et-Loire (3 années : dernière, -5 ans, -10 ans).
CREATE OR REPLACE VIEW parc_vp_37 AS
SELECT
  COMMUNE_CODE                                   AS code,
  motorisation(CARBURANT)                        AS motorisation,
  CRIT_AIR                                       AS crit_air,
  replace(colonne, 'PARC_', '')::INTEGER         AS annee,
  vehicules
FROM (UNPIVOT read_json('data/raw/parc_vp_37.json') ON COLUMNS('^PARC_') INTO NAME colonne VALUE vehicules);
