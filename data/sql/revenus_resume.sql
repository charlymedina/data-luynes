-- Revenus & emploi : les chiffres clés de Luynes, comparés à l'Indre-et-Loire et à la France,
-- et le classement de Luynes parmi les communes du département.
-- Résultat : src/data/generated/revenus_resume.json (une ligne).
WITH

-- Niveau de vie médian et taux de pauvreté (Filosofi). France = France métropolitaine (seul niveau publié ici).
filo AS (
  SELECT
    max(annee)                                                                             AS annee,
    max(valeur) FILTER (territoire = 'Luynes' AND mesure = 'MED_SL')                       AS niveau_vie,
    max(valeur) FILTER (territoire = 'Indre-et-Loire' AND mesure = 'MED_SL')               AS niveau_vie_37,
    max(valeur) FILTER (territoire LIKE 'France%' AND mesure = 'MED_SL')                   AS niveau_vie_france,
    max(valeur) FILTER (territoire = 'Luynes' AND mesure = 'PR_MD60')                      AS pauvrete,
    max(valeur) FILTER (territoire = 'Indre-et-Loire' AND mesure = 'PR_MD60')              AS pauvrete_37,
    max(valeur) FILTER (territoire LIKE 'France%' AND mesure = 'PR_MD60')                  AS pauvrete_france
  FROM filosofi
),

-- Rang du niveau de vie médian parmi les communes où il est publié (1 = le plus élevé)
rang_filo AS (
  SELECT
    rank() OVER (ORDER BY niveau_vie_median DESC) AS rang,
    count(*) OVER ()                              AS total,
    code
  FROM filosofi_communes_37
),

-- Taux de chômage des 15-64 ans au dernier recensement
chomage AS (
  SELECT
    territoire,
    100 * sum(personnes) FILTER (statut = '2') / sum(personnes) FILTER (statut = '1T2') AS taux
  FROM activite
  WHERE annee = (SELECT max(annee) FROM activite)
  GROUP BY territoire
),

rang_chomage AS (
  SELECT code, rank() OVER (ORDER BY taux_chomage DESC) AS rang, count(*) OVER () AS total
  FROM chomage_communes_37
  WHERE taux_chomage IS NOT NULL
),

-- Part des actifs en emploi qui travaillent dans une autre commune
navette AS (
  SELECT
    territoire,
    100 * sum(actifs) FILTER (lieu_travail = '20_30' AND transport = '_T')
        / sum(actifs) FILTER (lieu_travail = '_T' AND transport = '_T')            AS part_ailleurs,
    100 * sum(actifs) FILTER (lieu_travail = '_T' AND transport = '5')
        / sum(actifs) FILTER (lieu_travail = '_T' AND transport = '_T')            AS part_voiture
  FROM navettes
  WHERE annee = (SELECT max(annee) FROM navettes)
  GROUP BY territoire
),

sal AS (
  SELECT
    max(annee)                                                                     AS annee,
    max(salaire) FILTER (territoire = 'Luynes' AND sexe = '_T')                    AS salaire,
    max(salaire) FILTER (territoire = 'Indre-et-Loire' AND sexe = '_T')            AS salaire_37,
    max(salaire) FILTER (territoire = 'France' AND sexe = '_T')                    AS salaire_france,
    max(salaire) FILTER (territoire = 'Luynes' AND sexe = 'F')                     AS salaire_femmes,
    max(salaire) FILTER (territoire = 'Luynes' AND sexe = 'M')                     AS salaire_hommes
  FROM salaires
  WHERE annee = (SELECT max(annee) FROM salaires)
)

SELECT
  f.annee::INTEGER                                                   AS annee_revenus,
  round(f.niveau_vie)::INTEGER                                       AS niveau_vie,
  round(f.niveau_vie_37)::INTEGER                                    AS niveau_vie_37,
  round(f.niveau_vie_france)::INTEGER                                AS niveau_vie_france,
  round(f.pauvrete, 1)::DOUBLE                                       AS pauvrete,
  round(f.pauvrete_37, 1)::DOUBLE                                    AS pauvrete_37,
  round(f.pauvrete_france, 1)::DOUBLE                                AS pauvrete_france,
  (SELECT rang FROM rang_filo WHERE code = '37139')::INTEGER         AS rang_niveau_vie,
  (SELECT max(total) FROM rang_filo)::INTEGER                        AS nb_communes_niveau_vie,
  (SELECT max(annee) FROM activite)::INTEGER                         AS annee_recensement,
  round((SELECT taux FROM chomage WHERE territoire = 'Luynes'), 1)::DOUBLE          AS chomage,
  round((SELECT taux FROM chomage WHERE territoire = 'Indre-et-Loire'), 1)::DOUBLE  AS chomage_37,
  round((SELECT taux FROM chomage WHERE territoire = 'France'), 1)::DOUBLE          AS chomage_france,
  (SELECT rang FROM rang_chomage WHERE code = '37139')::INTEGER      AS rang_chomage,
  (SELECT max(total) FROM rang_chomage)::INTEGER                     AS nb_communes_chomage,
  round((SELECT part_ailleurs FROM navette WHERE territoire = 'Luynes'), 1)::DOUBLE          AS part_travail_ailleurs,
  round((SELECT part_ailleurs FROM navette WHERE territoire = 'Indre-et-Loire'), 1)::DOUBLE  AS part_travail_ailleurs_37,
  round((SELECT part_ailleurs FROM navette WHERE territoire = 'France'), 1)::DOUBLE          AS part_travail_ailleurs_france,
  round((SELECT part_voiture FROM navette WHERE territoire = 'Luynes'), 1)::DOUBLE           AS part_voiture,
  round((SELECT part_voiture FROM navette WHERE territoire = 'Indre-et-Loire'), 1)::DOUBLE   AS part_voiture_37,
  round((SELECT part_voiture FROM navette WHERE territoire = 'France'), 1)::DOUBLE           AS part_voiture_france,
  s.annee::INTEGER                                                   AS annee_salaires,
  round(s.salaire)::INTEGER                                          AS salaire,
  round(s.salaire_37)::INTEGER                                       AS salaire_37,
  round(s.salaire_france)::INTEGER                                   AS salaire_france,
  round(s.salaire_femmes)::INTEGER                                   AS salaire_femmes,
  round(s.salaire_hommes)::INTEGER                                   AS salaire_hommes
FROM filo f, sal s;
