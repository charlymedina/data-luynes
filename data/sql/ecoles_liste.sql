-- Écoles et collège ouverts à Luynes (annuaire de l'Éducation nationale), avec les élèves de la dernière rentrée.
-- Résultat : src/data/generated/ecoles_liste.json
WITH derniere AS (
  SELECT numero_ecole, eleves, classes FROM effectifs_ecoles WHERE rentree = (SELECT max(rentree) FROM effectifs_ecoles)
)
SELECT
  e.identifiant_de_l_etablissement                         AS uai,
  e.nom_etablissement                                      AS nom,
  CASE
    WHEN e.type_etablissement = 'Collège' THEN 'Collège'
    WHEN e.ecole_maternelle = 1 AND e.ecole_elementaire = 1 THEN 'École maternelle et élémentaire'
    WHEN e.ecole_maternelle = 1 THEN 'École maternelle'
    ELSE 'École élémentaire'
  END                                                      AS niveau,
  e.statut_public_prive                                    AS statut,
  d.eleves::INTEGER                                        AS eleves,
  d.classes::INTEGER                                       AS classes,
  e.latitude                                               AS lat,
  e.longitude                                              AS lon
FROM read_json('data/raw/ecoles_luynes.json') e
LEFT JOIN derniere d ON d.numero_ecole = e.identifiant_de_l_etablissement
WHERE e.etat = 'OUVERT'
ORDER BY e.type_etablissement = 'Collège', e.ecole_maternelle DESC, e.nom_etablissement;
