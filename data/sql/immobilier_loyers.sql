-- Loyers d'annonce du dernier millésime publié (charges comprises, en €/m²) des maisons et des appartements à Luynes,
-- comparés aux autres communes d'Indre-et-Loire. Source : « Carte des loyers » (ministère de la Transition
-- écologique), estimée à partir des annonces en ligne.
-- TYPPRED = « commune » si la commune a assez d'annonces pour une estimation propre ; sinon l'estimation
-- vient d'un regroupement de communes voisines (« maille »).
-- Rang 1 = la commune la plus chère du département.
-- Résultat : src/data/generated/immobilier_loyers.json (une ligne par type de logement).
WITH millesime AS (
  -- L'année est lue dans le titre du jeu (« … par commune en 2025 ») : elle suit les nouvelles publications.
  SELECT regexp_extract(title, 'par commune en (\d{4})', 1)::INTEGER AS annee
  FROM read_json('data/raw/loyers_millesime.json')
),
loyers AS (
  SELECT 'Maison' AS type_logement, unnest(data) AS r FROM read_json('data/raw/loyers_maisons_37.json')
  UNION ALL
  SELECT 'Appartement', unnest(data) FROM read_json('data/raw/loyers_appartements_37.json')
),
communes AS (
  SELECT
    type_logement,
    r.INSEE_C            AS code,
    r.loypredm2          AS loyer_m2,
    r."lwr.IPm2"         AS loyer_m2_bas,     -- bas de la fourchette (intervalle de prédiction)
    r."upr.IPm2"         AS loyer_m2_haut,
    r.TYPPRED            AS niveau_estimation,
    r.nbobs_com          AS annonces_commune
  FROM loyers
),
classement AS (
  SELECT
    *,
    rank() OVER (PARTITION BY type_logement ORDER BY loyer_m2 DESC) AS rang,
    count(*) OVER (PARTITION BY type_logement)                      AS nb_communes,
    median(loyer_m2) OVER (PARTITION BY type_logement)              AS mediane_37
  FROM communes
)
SELECT
  type_logement,
  (SELECT annee FROM millesime)          AS annee,
  round(loyer_m2, 1)::DOUBLE             AS loyer_m2,
  round(loyer_m2_bas, 1)::DOUBLE         AS loyer_m2_bas,
  round(loyer_m2_haut, 1)::DOUBLE        AS loyer_m2_haut,
  niveau_estimation,
  annonces_commune::INTEGER              AS annonces_commune,
  rang::INTEGER                          AS rang,
  nb_communes::INTEGER                   AS nb_communes,
  round(mediane_37, 1)::DOUBLE           AS loyer_m2_mediane_37
FROM classement
WHERE code = '37139'
ORDER BY type_logement DESC;   -- Maison, puis Appartement
