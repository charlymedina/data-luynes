-- Vues partagées du thème « Budget de la commune » (comptes individuels des communes, DGFiP).
-- Fichiers CSV (séparateur « ; ») : un par jeu DGFiP dans data/raw/budget_luynes/,
-- et les 272 communes du département (dernière année) dans data/raw/budget_communes_37/.
-- Unités DGFiP : montants en milliers d'euros (k€) ; colonnes « f… » = euros par habitant ;
-- colonnes « m… » = moyenne de la strate (communes de même taille) en euros par habitant ;
-- tfb / tmfb = taux de taxe foncière sur le bâti de la commune / moyenne de la strate (%).

-- Luynes, une ligne par année. Certains jeux DGFiP se recouvrent : on garde une seule ligne par année
-- (celle du jeu le plus récent, d'où le tri sur le nom de fichier).
CREATE OR REPLACE VIEW budget_luynes AS
SELECT * EXCLUDE (filename, doublon)
FROM (
  SELECT
    *,
    row_number() OVER (PARTITION BY an ORDER BY filename DESC) AS doublon
  FROM read_csv('data/raw/budget_luynes/*', delim = ';', header = true, filename = true, union_by_name = true)
)
WHERE doublon = 1;

-- Les communes d'Indre-et-Loire, dernière année publiée uniquement.
CREATE OR REPLACE VIEW budget_communes_37 AS
WITH toutes AS (
  SELECT * FROM read_csv('data/raw/budget_communes_37/*', delim = ';', header = true)
)
SELECT * FROM toutes WHERE an = (SELECT max(an) FROM toutes);
