-- Vues partagées du thème « Écoles, santé & services » (fichier « _ » : exécuté en premier, ne produit pas de JSON).

-- 1) Libellés des codes de la base permanente des équipements (BPE), extraits du référentiel INSEE
--    (data/reference/bpe_libelles.csv : niveau = FACILITY_DOM / FACILITY_SDOM / FACILITY_TYPE).
CREATE OR REPLACE VIEW bpe_libelles AS
SELECT niveau, code, libelle FROM read_csv('data/reference/bpe_libelles.csv', delim = ';', header = true);

-- 2) Nombre d'équipements par type, à Luynes et en Indre-et-Loire, pour la dernière année de la BPE.
CREATE OR REPLACE VIEW bpe AS
WITH observations AS (
  SELECT 'Luynes' AS territoire, unnest(observations) AS o FROM read_json('data/raw/bpe_luynes.json')
  UNION ALL
  SELECT 'Indre-et-Loire', unnest(observations) FROM read_json('data/raw/bpe_37.json')
),
lignes AS (
  SELECT
    territoire,
    o.dimensions.TIME_PERIOD::INTEGER  AS annee,
    o.dimensions.FACILITY_DOM          AS domaine,
    o.dimensions.FACILITY_SDOM         AS sous_domaine,
    o.dimensions.FACILITY_TYPE         AS type,
    o.measures.OBS_VALUE_NIVEAU.value  AS nombre
  FROM observations
)
SELECT * FROM lignes WHERE annee = (SELECT max(annee) FROM lignes);

-- 3) Populations utilisées pour les taux « pour 1 000 habitants » (populations légales, API Géo).
CREATE OR REPLACE VIEW populations_equipements AS
SELECT 'Luynes' AS territoire, population FROM read_json('data/raw/commune.json')
UNION ALL
SELECT 'Indre-et-Loire', sum(population) FROM read_json('data/raw/communes_37.json');

-- 4) Élèves des écoles (maternelles et élémentaires, publiques et privées) à chaque rentrée.
--    Les effectifs de Luynes sont filtrés en amont sur le nom de la commune (le code « commune » de ce
--    fichier est en réalité le code postal 37230, partagé avec Fondettes).
CREATE OR REPLACE VIEW effectifs_ecoles AS
SELECT
  left(rentree_scolaire, 4)::INTEGER AS rentree,
  numero_ecole,
  patronyme,
  secteur,
  nombre_total_classes              AS classes,
  nombre_total_eleves               AS eleves
FROM read_json('data/raw/effectifs_ecoles_luynes.json');
