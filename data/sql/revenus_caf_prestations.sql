-- Aides de la CAF à Luynes, prestation par prestation (dernier décembre publié), comparées à l'Indre-et-Loire.
-- Chaque ligne : le nombre de foyers de Luynes qui touchent la prestation et leur part parmi les ménages,
-- puis la même part pour le département. Un foyer peut toucher plusieurs prestations : les lignes ne s'additionnent pas.
-- Secret statistique : la CAF arrondit à 5 et affiche 0 quand il y a moins de 3 foyers ; on ne met jamais « 0 » à la place
-- d'un secret : la ligne est alors marquée « masque » et la page écrit « moins de 3 foyers ».
-- Non publiées par commune : l'allocation aux adultes handicapés (AAH), disponible seulement pour le département.
-- Résultat : src/data/generated/revenus_caf_prestations.json (une ligne par prestation).
WITH

annee AS (SELECT max(annee) AS annee FROM caf_communes),

menages AS (
  SELECT
    max(logements) FILTER (territoire = 'Luynes')         AS menages,
    max(logements) FILTER (territoire = 'Indre-et-Loire') AS menages_37
  FROM residences_principales
  WHERE periode = '_T' AND annee = (SELECT max(annee) FROM residences_principales)
),

-- Les prestations retenues : code CAF, groupe d'affichage, libellé, ordre. « principale » = ligne de tête du groupe.
prestations(code, groupe, libelle, principale, ordre) AS (VALUES
  ('ndural',   'Logement',               'Aides au logement',                              true,  1),
  ('apl',      'Logement',               'Aide personnalisée au logement (APL)',           false, 2),
  ('als',      'Logement',               'Allocation de logement sociale (ALS)',           false, 3),
  ('alf',      'Logement',               'Allocation de logement familiale (ALF)',         false, 4),
  ('ndurej',   'Familles',               'Prestations pour les familles',                  true,  5),
  ('af',       'Familles',               'Allocations familiales',                         false, 6),
  ('cf',       'Familles',               'Complément familial',                            false, 7),
  ('asf',      'Familles',               'Allocation de soutien familial',                 false, 8),
  ('ndurpaje', 'Petite enfance',         'Prestations pour les jeunes enfants (PAJE)',     true,  9),
  ('cmg',      'Petite enfance',         'Complément de libre choix du mode de garde',     false, 10),
  ('ab',       'Petite enfance',         'Allocation de base',                             false, 11),
  ('prepare',  'Petite enfance',         'Partage de l''éducation de l''enfant (PreParE)', false, 12),
  ('pn',       'Petite enfance',         'Prime à la naissance',                           false, 13),
  ('ppa',      'Revenus et solidarité',  'Prime d''activité',                              true,  14),
  ('rsa',      'Revenus et solidarité',  'Revenu de solidarité active (RSA)',              false, 15)
),

foyers AS (
  SELECT
    p.*,
    max(f.foyers) FILTER (f.territoire = 'Luynes')         AS foyers,
    max(f.foyers) FILTER (f.territoire = 'Indre-et-Loire') AS foyers_37
  FROM prestations p
  JOIN caf_foyers f ON f.prestation = p.code AND f.annee = (SELECT annee FROM annee) AND f.dtreffre LIKE '%-12'
  GROUP BY ALL
)

SELECT
  f.code, f.groupe, f.libelle, f.principale,
  f.foyers::INTEGER                                  AS foyers,
  f.foyers = 0                                       AS masque,
  round(100 * f.foyers / m.menages, 1)::DOUBLE       AS part_menages,
  f.foyers_37::INTEGER                               AS foyers_37,
  round(100 * f.foyers_37 / m.menages_37, 1)::DOUBLE AS part_menages_37
FROM foyers f, menages m
ORDER BY f.ordre;
