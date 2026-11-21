-- Vues partagées « Trésors du patrimoine » (fichier « _ » : exécuté en premier, ne produit pas de JSON).
-- Source : base Palissy (objets mobiliers protégés au titre des monuments historiques), ministère de la Culture (POP).
-- Une ligne de Palissy = une « notice » : un objet (lit, tableau…) OU un ensemble (ex. « quinze verrières »).
-- Le fichier est déjà limité à Luynes (code INSEE 37139, commune actuelle ou lors de la protection).
CREATE OR REPLACE VIEW patrimoine_objets AS
SELECT
  Reference                                                    AS reference,
  Titre_editorial                                              AS nom,
  Denomination                                                 AS denomination,
  -- « château » → « Château » (nom du lieu de conservation)
  upper(left(Nom_de_l_edifice, 1)) || substr(Nom_de_l_edifice, 2) AS lieu,
  -- « 18e s. » → 18 ; certains objets couvrent deux siècles (« 15e s.;16e s. ») : on garde le premier
  TRY_CAST(regexp_extract(Format_abrege_du_siecle_de_creation, '(\d+)e s', 1) AS INTEGER) AS siecle,
  Annee_de_creation                                            AS annee_creation,
  -- « 1966/12/20 : classé au titre objet » → 1966
  TRY_CAST(left(Date_et_typologie_de_la_protection, 4) AS INTEGER) AS annee_protection,
  CASE WHEN Typologie_de_la_protection LIKE 'classé%' THEN 'classé' ELSE 'inscrit' END AS protection,
  Statut_juridique_du_proprietaire                             AS proprietaire
FROM read_parquet('data/raw/palissy_luynes.parquet')
-- Refiltre ici aussi : la base Palissy donne à tort le code 37139 en « commune actuelle » à 2 notices
-- du château de Condé-en-Brie (Aisne, 02209) ; seul COG_Insee (commune d'origine) est fiable.
WHERE COG_Insee = '37139';
