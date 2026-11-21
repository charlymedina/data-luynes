-- Vues partagées du thème « Les rues de Luynes » (fichier « _ » : exécuté en premier, ne produit pas de JSON).
-- Source : Base Adresse Nationale (BAN, IGN / DINUM), adresses du code INSEE 37139 (le code postal 37230 est
-- partagé avec Fondettes : on ne s'en sert jamais).
-- Une ligne de la BAN = un point d'adresse (un numéro dans une voie ou un lieu-dit).

-- 1) Les adresses de Luynes.
CREATE OR REPLACE VIEW rues_adresses AS
SELECT
  id,
  nom_voie,
  numero::INTEGER   AS numero,
  lat::DOUBLE       AS lat,
  lon::DOUBLE       AS lon
FROM read_parquet('data/raw/rues_ban_luynes.parquet')
WHERE code_insee = '37139';

-- 2) Les noms de voies et de lieux-dits : une ligne par nom.
--    La BAN ne dit pas si un nom est une « voie » ou un « lieu-dit » : on lit le premier mot.
--    « Rue », « Chemin », « Impasse »… = voie ; tout autre nom (« Le Port de Luynes », « Les Doguins »…)
--    = lieu-dit ou quartier. (« la Rue barbier », qui commence par « la », est donc un lieu-dit.)
--    Le « centre » est l'adresse la plus proche de la moyenne des adresses du nom : un point qui est bien sur la voie.
CREATE OR REPLACE VIEW rues_noms AS
WITH centres AS (
  SELECT nom_voie, avg(lat) AS lat_moy, avg(lon) AS lon_moy FROM rues_adresses GROUP BY nom_voie
),
proches AS (
  SELECT
    a.nom_voie,
    count(*) AS adresses,
    arg_min(a.lat, power(a.lat - c.lat_moy, 2) + power(a.lon - c.lon_moy, 2)) AS lat,
    arg_min(a.lon, power(a.lat - c.lat_moy, 2) + power(a.lon - c.lon_moy, 2)) AS lon
  FROM rues_adresses a JOIN centres c USING (nom_voie)
  GROUP BY a.nom_voie
)
SELECT
  nom_voie,
  upper(left(nom_voie, 1)) || substr(nom_voie, 2)                       AS nom,
  lower(split_part(nom_voie, ' ', 1)) IN
    ('allée', 'avenue', 'boulevard', 'chemin', 'cours', 'impasse', 'passage', 'place', 'quai', 'route', 'rue', 'ruelle', 'sentier', 'square') AS est_voie,
  CASE WHEN lower(split_part(nom_voie, ' ', 1)) IN
    ('allée', 'avenue', 'boulevard', 'chemin', 'cours', 'impasse', 'passage', 'place', 'quai', 'route', 'rue', 'ruelle', 'sentier', 'square')
    THEN upper(left(split_part(nom_voie, ' ', 1), 1)) || lower(substr(split_part(nom_voie, ' ', 1), 2))
    ELSE 'Lieu-dit ou quartier' END                                      AS type_voie,
  adresses,
  lat,
  lon
FROM proches;

-- 3) Table de correspondance écrite à la main (data/reference/noms-de-rues.csv) : qui est honoré, sexe, catégorie…
--    Elle ne contient que des cas certains ; le reste est « Non déterminé ». Un nom de la table qui n'existe plus
--    dans la BAN est simplement ignoré.
CREATE OR REPLACE VIEW rues_reference AS
SELECT n.nom_voie, n.nom, n.type_voie, n.adresses, n.lat, n.lon,
       r.nature, r.sujet, r.sexe, r.categorie, nullif(r.description, '') AS description
FROM read_csv('data/reference/noms-de-rues.csv', delim = ';', header = true, all_varchar = true) r
JOIN rues_noms n ON n.nom_voie = r.nom_voie;
