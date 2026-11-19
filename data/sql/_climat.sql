-- Vues partagées du thème « Climat » (fichier « _ » : exécuté en premier, ne produit pas de JSON).
-- Source : relevés quotidiens Météo-France de l'Indre-et-Loire (data/raw/meteo_37/, fichiers « RR-T-Vent »).
-- Aucune station à Luynes : on garde la station de TOURS (aéroport de Parçay-Meslay, n° 37179001), à ~15 km,
-- qui mesure depuis novembre 1959.
--   TN = température minimale du jour, TX = maximale (°C) ; RR = pluie du jour (mm).

-- 1) Un relevé par jour à Tours.
CREATE OR REPLACE VIEW meteo_tours AS
SELECT
  strptime(AAAAMMJJ, '%Y%m%d')::DATE        AS jour,
  left(AAAAMMJJ, 4)::INTEGER                AS annee,
  substr(AAAAMMJJ, 5, 2)::INTEGER           AS mois,
  try_cast(TN AS DOUBLE)                    AS tn,
  try_cast(TX AS DOUBLE)                    AS tx,
  try_cast(RR AS DOUBLE)                    AS rr,
  try_cast(LAT AS DOUBLE)                   AS lat,
  try_cast(LON AS DOUBLE)                   AS lon
FROM read_csv('data/raw/meteo_37/*.csv.gz', delim = ';', all_varchar = true)
WHERE NUM_POSTE = '37179001';

-- 2) Bilan de chaque année COMPLÈTE (au moins 350 jours avec températures et pluie) : les années trouées
--    (début de la station, panne) ou l'année en cours fausseraient les moyennes et sont écartées.
CREATE OR REPLACE VIEW climat_annees_completes AS
SELECT
  annee,
  avg((tn + tx) / 2)                    AS temperature,   -- température moyenne de l'année
  count(*) FILTER (tn < 0)              AS jours_gel,     -- jours où il a gelé (minimale sous 0 °C)
  count(*) FILTER (tx >= 30)            AS jours_chaleur, -- jours de forte chaleur (maximale ≥ 30 °C)
  sum(rr)                               AS pluie          -- cumul de pluie de l'année (mm)
FROM meteo_tours
GROUP BY annee
HAVING count(tn) >= 350 AND count(tx) >= 350 AND count(rr) >= 350;
