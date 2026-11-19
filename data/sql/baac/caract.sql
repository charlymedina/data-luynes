-- Harmonisation du fichier « caractéristiques » d'une année d'accidents (BAAC, ONISR) pour l'Indre-et-Loire.
-- Exécuté par scripts/archive-baac.ts, une fois par année publiée ; {fichier}, {sep} et {annee} sont remplacés
-- par le script. Le résultat est archivé dans data/archive/baac/<année>-caract.parquet.
--
-- Deux formats coexistent :
--   * 2005-2018 : dep = « 370 », com = « 139 » (3 chiffres), heure « 1930 », coordonnées sans virgule
--                 (« 4742080 » = 47,42080), parfois à 0 quand l'accident n'est pas géolocalisé ;
--   * 2019 et après : dep = « 37 », com = « 37139 », heure « 19:30 », coordonnées « 47,42080483 ».
-- On ne garde ni l'adresse exacte ni le jour du mois au-delà du calcul du jour de la semaine.
SELECT
  Num_Acc                                                        AS num_acc,
  {annee}                                                        AS annee,
  mois::INTEGER                                                  AS mois,
  -- 1 = lundi … 7 = dimanche
  isodow(try_strptime(format('{}-{}-{}', {annee}, trim(mois), trim(jour)), '%Y-%m-%d')) AS jour_semaine,
  -- heure de l'accident (0 à 23)
  try_cast(left(lpad(replace(trim(hrmn), ':', ''), 4, '0'), 2) AS INTEGER) AS heure,
  try_cast(lum AS INTEGER)                                       AS luminosite,
  try_cast(atm AS INTEGER)                                       AS meteo,
  try_cast(agg AS INTEGER)                                       AS agglomeration,
  -- code INSEE à 5 chiffres de la commune
  CASE WHEN length(trim(com)) = 5 THEN trim(com)
       ELSE left(trim(dep), 2) || lpad(trim(com), 3, '0') END    AS code_commune,
  -- latitude / longitude en degrés décimaux (NULL si absentes ou à 0)
  CASE WHEN contains(lat, ',') THEN try_cast(replace(trim(lat), ',', '.') AS DOUBLE)
       ELSE try_cast(trim(lat) AS DOUBLE) / 100000 END           AS lat,
  CASE WHEN contains(long, ',') THEN try_cast(replace(trim(long), ',', '.') AS DOUBLE)
       ELSE try_cast(trim(long) AS DOUBLE) / 100000 END          AS lon
FROM read_csv('{fichier}', delim = '{sep}', all_varchar = true, header = true)
WHERE trim(dep) IN ('37', '370');
