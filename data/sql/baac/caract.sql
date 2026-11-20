-- Harmonisation du fichier « caractéristiques » d'une année d'accidents (BAAC, ONISR) pour l'Indre-et-Loire.
-- Exécuté par scripts/archive-baac.ts, une fois par année publiée : la vue « brut » est le fichier téléchargé
-- (colonnes absentes de certains formats ajoutées vides) et {annee} est remplacé par l'année.
-- Le résultat est archivé dans data/archive/baac/<année>-caract.parquet.
--
-- Deux formats coexistent :
--   * 2005-2018 : dep = « 370 », com = « 139 » (3 chiffres), heure « 1930 », coordonnées sans virgule
--                 (« 4742080 » = 47,42080), parfois à 0 quand l'accident n'est pas géolocalisé ;
--   * 2019 et après : dep = « 37 », com = « 37139 », heure « 19:30 », coordonnées « 47,42080483 ».
-- On garde les informations publiées sur l'accident, sauf l'adresse (la route vient du fichier « lieux »).
SELECT
  Num_Acc                                                        AS num_acc,
  {annee}                                                        AS annee,
  mois::INTEGER                                                  AS mois,
  try_cast(jour AS INTEGER)                                      AS jour,
  -- 1 = lundi … 7 = dimanche
  isodow(try_strptime(format('{}-{}-{}', {annee}, trim(mois), trim(jour)), '%Y-%m-%d')) AS jour_semaine,
  -- heure et minute de l'accident
  try_cast(left(lpad(replace(trim(hrmn), ':', ''), 4, '0'), 2) AS INTEGER)  AS heure,
  try_cast(right(lpad(replace(trim(hrmn), ':', ''), 4, '0'), 2) AS INTEGER) AS minute,
  try_cast(lum AS INTEGER)                                       AS luminosite,
  try_cast(atm AS INTEGER)                                       AS meteo,
  try_cast(agg AS INTEGER)                                       AS agglomeration,
  -- intersection (1 hors intersection, 2 en X, 3 en T, 4 en Y, 5 à plus de 4 branches, 6 giratoire, 7 place,
  -- 8 passage à niveau, 9 autre) et type de collision (1 frontale, 2 par l'arrière, 3 par le côté, 4 en chaîne,
  -- 5 collisions multiples, 6 autre collision, 7 sans collision)
  try_cast("int" AS INTEGER)                                     AS intersection,
  try_cast(col AS INTEGER)                                       AS collision,
  -- code INSEE à 5 chiffres de la commune
  CASE WHEN length(trim(com)) = 5 THEN trim(com)
       ELSE left(trim(dep), 2) || lpad(trim(com), 3, '0') END    AS code_commune,
  -- latitude / longitude en degrés décimaux (NULL si absentes ou à 0)
  CASE WHEN contains(lat, ',') THEN try_cast(replace(trim(lat), ',', '.') AS DOUBLE)
       ELSE try_cast(trim(lat) AS DOUBLE) / 100000 END           AS lat,
  CASE WHEN contains(long, ',') THEN try_cast(replace(trim(long), ',', '.') AS DOUBLE)
       ELSE try_cast(trim(long) AS DOUBLE) / 100000 END          AS lon
FROM brut
WHERE trim(dep) IN ('37', '370');
