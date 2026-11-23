-- Aides de la CAF : combien de foyers de Luynes sont allocataires, et leur place parmi les communes d'Indre-et-Loire.
-- « Foyer allocataire » = foyer qui touche au moins une prestation légale de la CAF (hors allocation de rentrée scolaire).
-- On rapporte ce nombre aux ménages du dernier recensement (résidences principales) : c'est une part approximative,
-- car les deux chiffres ne datent pas de la même année et la CAF arrondit les nombres de foyers à 5.
-- Résultat : src/data/generated/revenus_caf_resume.json (une ligne).
WITH

-- Dernier décembre publié par la CAF pour les communes
derniere AS (
  SELECT max(annee) AS annee FROM caf_communes
),

-- Ménages au dernier recensement : Luynes, Indre-et-Loire
menages AS (
  SELECT
    max(annee)                                          AS annee_recensement,
    max(logements) FILTER (territoire = 'Luynes')         AS menages,
    max(logements) FILTER (territoire = 'Indre-et-Loire') AS menages_37
  FROM residences_principales
  WHERE periode = '_T' AND annee = (SELECT max(annee) FROM residences_principales)
),

luynes AS (
  SELECT foyers, annee FROM caf_foyers
  WHERE territoire = 'Luynes' AND prestation = 'ndur' AND annee = (SELECT annee FROM derniere) AND dtreffre LIKE '%-12'
),

-- Indre-et-Loire, au même mois que Luynes (décembre)
departement AS (
  SELECT foyers FROM caf_foyers
  WHERE territoire = 'Indre-et-Loire' AND prestation = 'ndur' AND annee = (SELECT annee FROM derniere) AND dtreffre LIKE '%-12'
),

-- Classement : part de foyers allocataires parmi les ménages de chaque commune (1 = la part la plus élevée)
classement AS (
  SELECT
    c.code,
    rank() OVER (ORDER BY c.indfoy_ndur / m.menages DESC) AS rang,
    count(*) OVER ()                                      AS total
  FROM caf_communes c
  JOIN menages_communes_37 m ON m.code = c.code AND m.annee = (SELECT annee_recensement FROM menages)
  WHERE c.annee = (SELECT annee FROM derniere) AND m.menages > 0
)

SELECT
  l.annee::INTEGER                                              AS annee,
  l.foyers::INTEGER                                             AS foyers,
  (SELECT indnbp_ndur FROM caf_communes WHERE code = '37139' AND annee = l.annee)::INTEGER AS personnes,
  m.annee_recensement::INTEGER                                  AS annee_recensement,
  round(m.menages)::INTEGER                                     AS menages,
  round(100 * l.foyers / m.menages, 1)::DOUBLE                  AS part_menages,
  d.foyers::INTEGER                                             AS foyers_37,
  round(m.menages_37)::INTEGER                                  AS menages_37,
  round(100 * d.foyers / m.menages_37, 1)::DOUBLE               AS part_menages_37,
  (SELECT rang FROM classement WHERE code = '37139')::INTEGER   AS rang,
  (SELECT max(total) FROM classement)::INTEGER                  AS nb_communes
FROM luynes l, departement d, menages m;
