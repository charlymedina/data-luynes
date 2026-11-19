-- Vues partagées du thème « Délinquance » (utilisées par les requêtes delinquance_*.sql).
-- Source : SSMSI (service statistique du ministère de l'Intérieur), faits enregistrés par la police et la gendarmerie.
-- Attention : ce n'est pas toute la délinquance (seulement ce qui est signalé et enregistré).

-- Luynes, chaque indicateur et chaque année. Quand un indicateur compte moins de 5 faits sur 3 ans, le SSMSI ne le
-- publie pas (« ndiff », secret statistique) : le nombre est alors laissé vide, sans jamais être estimé.
CREATE OR REPLACE VIEW delinquance_luynes AS
SELECT
  indicateur,
  unite_de_compte,
  annee,
  CASE WHEN est_diffuse = 'diff' THEN nombre END   AS nombre,
  est_diffuse = 'diff'                             AS diffuse,
  insee_pop                                        AS population,
  insee_log                                        AS logements
FROM read_parquet('data/raw/delinquance_communes/*.parquet')
WHERE CODGEO_2026 = '37139';

-- Indre-et-Loire et France entière (somme de tous les départements), chaque indicateur et chaque année.
-- Les nombres du fichier départemental sont des textes ; les populations et logements aussi.
CREATE OR REPLACE VIEW delinquance_territoires AS
WITH dep AS (
  SELECT
    Code_departement                              AS departement,
    annee::INTEGER                                AS annee,
    indicateur,
    replace(nombre, ',', '.')::DOUBLE             AS nombre,
    insee_pop::DOUBLE                             AS population,
    insee_log::DOUBLE                             AS logements
  FROM read_csv('data/raw/delinquance_departements/*.csv', all_varchar = true)
)
SELECT 'Indre-et-Loire' AS territoire, indicateur, annee, nombre, population, logements FROM dep WHERE departement = '37'
UNION ALL
SELECT 'France', indicateur, annee, sum(nombre), sum(population), sum(logements) FROM dep GROUP BY indicateur, annee;

-- Indicateurs retenus, avec un libellé court et le dénominateur de leur taux :
-- les cambriolages se rapportent aux logements, tout le reste aux habitants.
-- Les indicateurs « stupéfiants » mesurent l'activité des services (personnes mises en cause), pas des victimes :
-- ils ne sont pas retenus. Les vols d'accessoires sur véhicules ne sont jamais publiés à Luynes (trop peu de faits).
CREATE OR REPLACE VIEW delinquance_indicateurs_retenus AS
SELECT * FROM (VALUES
  ('Cambriolages de logement',                        'Cambriolages',                       'logements', 1),
  ('Vols sans violence contre des personnes',         'Vols sans violence',                 'habitants', 2),
  ('Vols dans les véhicules',                         'Vols dans les véhicules',            'habitants', 3),
  ('Vols de véhicule',                                'Vols de véhicules',                  'habitants', 4),
  ('Vols violents sans arme',                         'Vols violents sans arme',            'habitants', 5),
  ('Vols avec armes',                                 'Vols avec arme',                     'habitants', 6),
  ('Destructions et dégradations volontaires',        'Dégradations volontaires',           'habitants', 7),
  ('Escroqueries et fraudes aux moyens de paiement',  'Escroqueries et fraudes',            'habitants', 8),
  ('Violences physiques hors cadre familial',         'Violences physiques (hors famille)', 'habitants', 9),
  ('Violences physiques intrafamiliales',             'Violences intrafamiliales',          'habitants', 10),
  ('Violences sexuelles',                             'Violences sexuelles',                'habitants', 11)
) AS t(indicateur, libelle, rapporte_a, ordre);
