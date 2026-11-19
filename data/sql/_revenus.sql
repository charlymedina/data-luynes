-- Vues partagées du thème « Revenus & emploi » (fichiers INSEE Melodi : une liste « observations »,
-- chaque observation porte des « dimensions » et une valeur). On les met à plat en tableaux.
-- Territoires : le code GEO est préfixé du millésime géographique (« 2026-COM-37139 ») → on lit la fin.

CREATE OR REPLACE MACRO territoire(geo) AS CASE
  WHEN geo LIKE '%COM-37139' THEN 'Luynes'
  WHEN geo LIKE '%DEP-37'    THEN 'Indre-et-Loire'
  WHEN geo LIKE '%FRANCE-F'  THEN 'France'
  WHEN geo LIKE '%FRANCE-FM' THEN 'France métropolitaine'
  ELSE geo
END;

-- Filosofi : niveau de vie médian (MED_SL, € par an et par « unité de consommation ») et taux de pauvreté
-- (PR_MD60, % de personnes sous 60 % du niveau de vie médian national). Valeur absente = secret statistique.
CREATE OR REPLACE VIEW filosofi AS
SELECT
  territoire(o.dimensions.GEO)              AS territoire,
  o.dimensions.TIME_PERIOD::INTEGER         AS annee,
  o.dimensions.FILOSOFI_MEASURE             AS mesure,
  o.measures.OBS_VALUE_NIVEAU.value::DOUBLE AS valeur
FROM (SELECT unnest(observations) AS o FROM read_json('data/raw/filosofi.json'));

-- Niveau de vie médian de chaque commune du département (communes sous secret statistique exclues).
CREATE OR REPLACE VIEW filosofi_communes_37 AS
SELECT
  regexp_extract(o.dimensions.GEO, 'COM-(\d+)', 1) AS code,
  o.measures.OBS_VALUE_NIVEAU.value::DOUBLE        AS niveau_vie_median
FROM (SELECT unnest(observations) AS o FROM read_json('data/raw/filosofi_communes_37.json'))
WHERE o.measures.OBS_VALUE_NIVEAU.value IS NOT NULL;

-- Recensement : situation des 15-64 ans (EMPSTA_ENQ : 1 = en emploi, 2 = chômeur, 1T2 = actifs,
-- 31 = retraité, 33 = élève ou étudiant, 35T36 = autre inactif, _T = tous). On garde la France entière (FRANCE-F).
CREATE OR REPLACE VIEW activite AS
SELECT
  territoire(o.dimensions.GEO)              AS territoire,
  o.dimensions.TIME_PERIOD::INTEGER         AS annee,
  o.dimensions.EMPSTA_ENQ                   AS statut,
  o.measures.OBS_VALUE_NIVEAU.value::DOUBLE AS personnes
FROM (SELECT unnest(observations) AS o FROM read_json('data/raw/activite.json'))
WHERE o.dimensions.GEO NOT LIKE '%FRANCE-FM';

-- Taux de chômage (au sens du recensement) des 15-64 ans de chaque commune du département.
CREATE OR REPLACE VIEW chomage_communes_37 AS
SELECT
  regexp_extract(o.dimensions.GEO, 'COM-(\d+)', 1) AS code,
  100 * sum(o.measures.OBS_VALUE_NIVEAU.value) FILTER (o.dimensions.EMPSTA_ENQ = '2')
      / nullif(sum(o.measures.OBS_VALUE_NIVEAU.value) FILTER (o.dimensions.EMPSTA_ENQ = '1T2'), 0) AS taux_chomage
FROM (SELECT unnest(observations) AS o FROM read_json('data/raw/chomage_communes_37.json'))
GROUP BY 1;

-- Navettes : actifs en emploi selon le lieu de travail (WORK_AREA : 10 = dans la commune de résidence,
-- 21 = autre commune du département, 22 = autre département de la région, 23 = autre région, 24T30 = étranger)
-- et le moyen de transport (TRANS : 1 = aucun, 2 = marche, 3 = vélo, 4 = deux-roues motorisé, 5 = voiture,
-- 6 = transports en commun).
CREATE OR REPLACE VIEW navettes AS
SELECT
  territoire(o.dimensions.GEO)              AS territoire,
  o.dimensions.TIME_PERIOD::INTEGER         AS annee,
  o.dimensions.WORK_AREA                    AS lieu_travail,
  o.dimensions.TRANS                        AS transport,
  o.measures.OBS_VALUE_NIVEAU.value::DOUBLE AS actifs
FROM (SELECT unnest(observations) AS o FROM read_json('data/raw/navettes.json'))
WHERE o.dimensions.GEO NOT LIKE '%FRANCE-FM';

-- Salaire net mensuel moyen en équivalent temps plein, secteur privé (SEX : F, M, _T = ensemble).
CREATE OR REPLACE VIEW salaires AS
SELECT
  territoire(o.dimensions.GEO)              AS territoire,
  o.dimensions.TIME_PERIOD::INTEGER         AS annee,
  o.dimensions.SEX                          AS sexe,
  o.measures.OBS_VALUE_NIVEAU.value::DOUBLE AS salaire
FROM (SELECT unnest(observations) AS o FROM read_json('data/raw/salaires.json'))
WHERE o.dimensions.GEO NOT LIKE '%FRANCE-FM';
