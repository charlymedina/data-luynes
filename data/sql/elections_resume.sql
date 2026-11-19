-- Chiffres clés du thème « Élections » (une ligne).
-- Résultat : src/data/generated/elections_resume.json
WITH dernier AS (
  -- Le scrutin le plus récent (tous types confondus)
  SELECT * FROM scrutins ORDER BY annee DESC, tour DESC LIMIT 1
),

premiers_tours AS (
  SELECT * FROM scrutins WHERE tour = 1
),

record_haut AS (
  SELECT type, annee, participation_luynes FROM premiers_tours ORDER BY participation_luynes DESC LIMIT 1
),

record_bas AS (
  SELECT type, annee, participation_luynes FROM premiers_tours ORDER BY participation_luynes ASC LIMIT 1
),

-- Scrutins (1ers tours) où Luynes a voté plus que la moyenne nationale
au_dessus AS (
  SELECT
    count(*) FILTER (participation_luynes > participation_france) AS fois_au_dessus,
    count(*)                                                       AS fois
  FROM premiers_tours
)

SELECT
  (SELECT min(annee) FROM scrutins)                         AS premiere_annee,
  (SELECT count(*) FROM scrutins)::INTEGER                  AS nb_tours,
  d.type                                                    AS dernier_type,
  d.annee                                                   AS derniere_annee,
  d.tour                                                    AS dernier_tour,
  d.inscrits_luynes::INTEGER                                AS inscrits,
  d.bureaux_luynes::INTEGER                                 AS bureaux,
  h.type                                                    AS record_haut_type,
  h.annee                                                   AS record_haut_annee,
  round(h.participation_luynes, 1)::DOUBLE                  AS record_haut_participation,
  b.type                                                    AS record_bas_type,
  b.annee                                                   AS record_bas_annee,
  round(b.participation_luynes, 1)::DOUBLE                  AS record_bas_participation,
  a.fois_au_dessus::INTEGER                                 AS fois_au_dessus_france,
  a.fois::INTEGER                                           AS nb_premiers_tours
FROM dernier d, record_haut h, record_bas b, au_dessus a;
