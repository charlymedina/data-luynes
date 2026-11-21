-- Chiffres clés de l'eau du robinet à Luynes, et comparaison avec l'Indre-et-Loire sur les mêmes années récentes.
-- Résultat : src/data/generated/eau_resume.json (une ligne)
WITH f AS (SELECT * FROM eau_fenetre),

luynes AS (
  SELECT
    min(annee)                                                                  AS annee_debut,
    max(annee)                                                                  AS annee_fin,
    count(*)                                                                    AS prelevements,
    -- part des prélèvements conformes, parmi ceux où la conformité a été évaluée (C ou N)
    100 * count(*) FILTER (bact = 'C') / count(*) FILTER (bact IN ('C', 'N'))  AS conformes_bact,
    100 * count(*) FILTER (physico_chimie = 'C') / count(*) FILTER (physico_chimie IN ('C', 'N')) AS conformes_pc,
    count(*) FILTER (bact IN ('C', 'N'))                                        AS evalues_bact,   -- dénominateur du taux (les autres n'ont pas de conclusion)
    count(*) FILTER (bact = 'N')                                                AS non_conformes_bact,
    count(*) FILTER (physico_chimie = 'N')                                      AS non_conformes_pc
  FROM eau_prelevements
),

-- mesures de Luynes sur la fenêtre de comparaison
luynes_fenetre AS (
  SELECT
    avg(resultat_numerique) FILTER (code_parametre = '1340') AS nitrates,
    max(resultat_numerique) FILTER (code_parametre = '1340') AS nitrates_max,
    avg(resultat_numerique) FILTER (code_parametre = '1345') AS durete,
    100 * count(DISTINCT code_prelevement) FILTER (code_parametre = '1449' AND bact = 'C')
        / count(DISTINCT code_prelevement) FILTER (code_parametre = '1449' AND bact IN ('C', 'N')) AS conformes_bact
  FROM eau_analyses, f
  WHERE annee BETWEEN f.annee_debut AND f.annee_fin
),

-- moyenne de chaque commune du département (pour un classement), puis ensemble du département
par_commune AS (
  SELECT code_commune, parametre, avg(resultat_numerique) AS moyenne
  FROM eau_37
  WHERE parametre IN ('nitrates', 'durete')
  GROUP BY ALL
),

departement AS (
  SELECT
    avg(resultat_numerique) FILTER (parametre = 'nitrates') AS nitrates,
    avg(resultat_numerique) FILTER (parametre = 'durete')   AS durete,
    100 * count(*) FILTER (parametre = 'bacterio' AND bact = 'C')
        / count(*) FILTER (parametre = 'bacterio' AND bact IN ('C', 'N')) AS conformes_bact
  FROM eau_37
),

rangs AS (
  -- rang 1 = la moyenne la plus élevée (le plus de nitrates / l'eau la plus calcaire)
  SELECT
    parametre,
    rank() OVER (PARTITION BY parametre ORDER BY moyenne DESC) AS rang,
    count(*) OVER (PARTITION BY parametre)                    AS nb_communes,
    code_commune
  FROM par_commune
)

SELECT
  l.annee_debut,
  l.annee_fin,
  l.prelevements::INTEGER                                       AS prelevements,
  round(l.conformes_bact, 1)::DOUBLE                            AS conformes_bact,
  round(l.conformes_pc, 1)::DOUBLE                              AS conformes_pc,
  l.evalues_bact::INTEGER                                       AS evalues_bact,
  l.non_conformes_bact::INTEGER                                 AS non_conformes_bact,
  l.non_conformes_pc::INTEGER                                   AS non_conformes_pc,
  f.annee_debut                                                 AS fenetre_debut,
  f.annee_fin                                                   AS fenetre_fin,
  round(lf.nitrates, 1)::DOUBLE                                 AS nitrates_luynes,     -- mg/L
  round(lf.nitrates_max, 1)::DOUBLE                             AS nitrates_max_luynes,
  round(d.nitrates, 1)::DOUBLE                                  AS nitrates_37,
  round(lf.durete, 1)::DOUBLE                                   AS durete_luynes,       -- °f (degrés français)
  round(d.durete, 1)::DOUBLE                                    AS durete_37,
  round(lf.conformes_bact, 1)::DOUBLE                           AS conformes_bact_fenetre_luynes,
  round(d.conformes_bact, 1)::DOUBLE                            AS conformes_bact_37,
  (SELECT rang FROM rangs WHERE parametre = 'nitrates' AND code_commune = '37139')::INTEGER   AS rang_nitrates,
  (SELECT max(nb_communes) FROM rangs WHERE parametre = 'nitrates')::INTEGER                  AS nb_communes_nitrates,
  (SELECT rang FROM rangs WHERE parametre = 'durete' AND code_commune = '37139')::INTEGER     AS rang_durete,
  (SELECT max(nb_communes) FROM rangs WHERE parametre = 'durete')::INTEGER                    AS nb_communes_durete,
  (SELECT any_value(nom_distributeur) FROM eau_analyses WHERE annee = l.annee_fin)            AS distributeur
FROM luynes l, f, luynes_fenetre lf, departement d;
