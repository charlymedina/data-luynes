-- Monuments historiques de Luynes (base Mérimée du ministère de la Culture), du plus anciennement protégé au plus récent.
-- Résultat : src/data/generated/patrimoine_monuments.json (une ligne par monument).
WITH monuments AS (
  SELECT unnest(data) AS m FROM read_json('data/raw/monuments_luynes.json')
)

SELECT
  m.Reference                                              AS reference,
  m.Titre_editorial_de_la_notice                           AS nom,
  m.Denomination_de_l_edifice                              AS type,
  -- « classé MH » est la protection la plus forte, « inscrit MH » la plus courante
  CASE WHEN m.Typologie_de_la_protection LIKE 'classé%' THEN 'classé' ELSE 'inscrit' END AS protection,
  m.Typologie_de_la_protection LIKE '%partiellement'       AS protection_partielle,
  -- « 1926/07/17 : inscrit MH » → 1926 (première date citée)
  left(m.Date_et_typologie_de_la_protection, 4)::INTEGER   AS annee_protection,
  -- « 13e s.;15e s.;17e s. » → « 13e s., 15e s., 17e s. »
  replace(m.Format_abrege_du_siecle_de_construction, ';', ', ') AS epoque,
  m.Statut_juridique_de_l_edifice                          AS proprietaire,
  -- « 47.387,0.554 » → latitude puis longitude
  split_part(m.coordonnees_au_format_WGS84, ',', 1)::DOUBLE AS latitude,
  split_part(m.coordonnees_au_format_WGS84, ',', 2)::DOUBLE AS longitude
FROM monuments
ORDER BY annee_protection, nom;
