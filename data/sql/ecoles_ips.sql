-- Indice de position sociale (IPS) des écoles et du collège de Luynes, à la dernière rentrée publiée.
-- L'IPS résume le milieu social des familles des élèves (profession des parents) : 100 = moyenne nationale
-- de référence, plus il est élevé, plus les familles sont favorisées. Il n'est pas publié pour les écoles
-- maternelles seules.
-- On compare chaque établissement à la moyenne du département et de la France pour son secteur (public / privé).
-- Résultat : src/data/generated/ecoles_ips.json (une ligne par établissement).
WITH etablissements AS (
  -- Les établissements ouverts de Luynes, d'après l'annuaire (filtre par UAI : pas de piège de code postal)
  SELECT identifiant_de_l_etablissement AS uai, nom_etablissement AS nom, type_etablissement
  FROM read_json('data/raw/ecoles_luynes.json')
  WHERE etat = 'OUVERT'
),

ips AS (
  SELECT uai, rentree_scolaire, secteur, ips::DOUBLE AS ips,
         ips_departemental_public::DOUBLE AS dep_public, ips_departemental_prive::DOUBLE AS dep_prive,
         ips_national_public::DOUBLE AS fr_public, ips_national_prive::DOUBLE AS fr_prive,
         ips_departemental::DOUBLE AS dep_tous, ips_national::DOUBLE AS fr_tous
  FROM read_json('data/raw/ips_ecoles_luynes.json')
  UNION ALL BY NAME
  SELECT uai, rentree_scolaire, secteur, ips::DOUBLE AS ips,
         ips_departemental_public::DOUBLE AS dep_public, ips_departemental_prive::DOUBLE AS dep_prive,
         ips_national_public::DOUBLE AS fr_public, ips_national_prive::DOUBLE AS fr_prive,
         ips_departemental::DOUBLE AS dep_tous, ips_national::DOUBLE AS fr_tous
  FROM read_json('data/raw/ips_college_luynes.json')
),

derniere AS (
  -- Une seule ligne par établissement : la rentrée la plus récente
  SELECT * FROM ips QUALIFY row_number() OVER (PARTITION BY uai ORDER BY rentree_scolaire DESC) = 1
)

SELECT
  e.uai,
  e.nom,
  e.type_etablissement = 'Collège'                         AS est_college,
  d.rentree_scolaire                                       AS rentree,
  CASE WHEN d.secteur ILIKE 'priv%' THEN 'privé' ELSE 'public' END AS secteur,
  round(d.ips, 1)::DOUBLE                                  AS ips,
  -- Moyennes du même secteur (public ou privé) : la comparaison la plus juste
  round(CASE WHEN d.secteur ILIKE 'priv%' THEN d.dep_prive ELSE d.dep_public END, 1)::DOUBLE AS ips_37_secteur,
  round(CASE WHEN d.secteur ILIKE 'priv%' THEN d.fr_prive ELSE d.fr_public END, 1)::DOUBLE   AS ips_france_secteur,
  round(d.dep_tous, 1)::DOUBLE                             AS ips_37,
  round(d.fr_tous, 1)::DOUBLE                              AS ips_france
FROM derniere d
JOIN etablissements e USING (uai)
ORDER BY est_college, e.nom;
