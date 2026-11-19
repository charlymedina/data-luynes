-- Chiffres clés du climat à Tours : réchauffement, gel, chaleur, pluie, records.
-- « Avant » = les 10 premières années complètes de la station ; « aujourd'hui » = les 10 dernières.
-- Résultat : src/data/generated/climat_resume.json (une ligne).
WITH annees AS (
  SELECT *,
    row_number() OVER (ORDER BY annee)      AS depuis_debut,
    row_number() OVER (ORDER BY annee DESC) AS depuis_fin
  FROM climat_annees_completes
),
avant AS (
  SELECT min(annee) AS debut, max(annee) AS fin, avg(temperature) AS t, avg(jours_gel) AS gel,
         avg(jours_chaleur) AS chaleur, avg(pluie) AS pluie
  FROM annees WHERE depuis_debut <= 10
),
recent AS (
  SELECT min(annee) AS debut, max(annee) AS fin, avg(temperature) AS t, avg(jours_gel) AS gel,
         avg(jours_chaleur) AS chaleur, avg(pluie) AS pluie
  FROM annees WHERE depuis_fin <= 10
),
-- Records journaliers (sur tous les jours mesurés depuis 1959)
record_chaud AS (SELECT tx, jour FROM meteo_tours WHERE tx IS NOT NULL ORDER BY tx DESC, jour LIMIT 1),
record_froid AS (SELECT tn, jour FROM meteo_tours WHERE tn IS NOT NULL ORDER BY tn, jour LIMIT 1),
record_pluie AS (SELECT rr, jour FROM meteo_tours WHERE rr IS NOT NULL ORDER BY rr DESC, jour LIMIT 1),
-- Année la plus chaude / la plus fraîche
annee_chaude AS (SELECT annee, temperature FROM climat_annees_completes ORDER BY temperature DESC LIMIT 1),
annee_fraiche AS (SELECT annee, temperature FROM climat_annees_completes ORDER BY temperature LIMIT 1),
-- Rang des années récentes parmi les plus chaudes : combien des 10 années les plus chaudes sont récentes ?
top10 AS (SELECT annee FROM climat_annees_completes ORDER BY temperature DESC LIMIT 10),
-- Distance entre la station et le centre de Luynes (km, à vol d'oiseau)
station AS (SELECT any_value(lat) AS lat, any_value(lon) AS lon FROM meteo_tours),
luynes AS (SELECT centre.coordinates[2] AS lat, centre.coordinates[1] AS lon FROM read_json('data/raw/commune.json'))

SELECT
  (SELECT min(annee) FROM meteo_tours)::INTEGER                AS premiere_annee_mesures,
  a.debut::INTEGER AS avant_debut, a.fin::INTEGER AS avant_fin,
  r.debut::INTEGER AS recent_debut, r.fin::INTEGER AS recent_fin,
  round(a.t, 1)::DOUBLE        AS temperature_avant,
  round(r.t, 1)::DOUBLE        AS temperature_recente,
  round(r.t - a.t, 1)::DOUBLE  AS rechauffement,
  round(a.gel)::INTEGER        AS jours_gel_avant,
  round(r.gel)::INTEGER        AS jours_gel_recent,
  round(a.chaleur, 1)::DOUBLE  AS jours_chaleur_avant,
  round(r.chaleur, 1)::DOUBLE  AS jours_chaleur_recent,
  round(a.pluie)::INTEGER      AS pluie_avant,
  round(r.pluie)::INTEGER      AS pluie_recente,
  rc.tx::DOUBLE                AS record_chaleur,
  strftime(rc.jour, '%Y-%m-%d') AS record_chaleur_jour,
  rf.tn::DOUBLE                AS record_froid,
  strftime(rf.jour, '%Y-%m-%d') AS record_froid_jour,
  rp.rr::DOUBLE                AS record_pluie,
  strftime(rp.jour, '%Y-%m-%d') AS record_pluie_jour,
  ac.annee::INTEGER            AS annee_plus_chaude,
  round(ac.temperature, 1)::DOUBLE AS temperature_annee_plus_chaude,
  af.annee::INTEGER            AS annee_plus_fraiche,
  (SELECT count(*) FROM top10 WHERE annee >= r.debut)::INTEGER AS annees_recentes_dans_top10,
  round(2 * 6371 * asin(sqrt(
      pow(sin(radians(s.lat - l.lat) / 2), 2)
    + cos(radians(l.lat)) * cos(radians(s.lat)) * pow(sin(radians(s.lon - l.lon) / 2), 2)
  )))::INTEGER                 AS distance_station_km
FROM avant a, recent r, record_chaud rc, record_froid rf, record_pluie rp, annee_chaude ac, annee_fraiche af, station s, luynes l;
