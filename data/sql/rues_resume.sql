-- Chiffres clés des rues de Luynes (Base Adresse Nationale + table de correspondance des noms de personnes).
-- « Voies » = rues, chemins, impasses, places… ; « lieux-dits » = les autres noms (hameaux, quartiers).
-- Les personnes honorées viennent de data/reference/noms-de-rues.csv (cas certains seulement).
-- Résultat : src/data/generated/rues_resume.json (une ligne)
WITH personnes AS (
  SELECT * FROM rues_reference WHERE nature = 'personne'
),
plus_peuplee AS (
  SELECT nom, adresses FROM rues_noms WHERE est_voie ORDER BY adresses DESC, nom LIMIT 1
),
plus_peuplee_ld AS (
  SELECT nom, adresses FROM rues_noms WHERE NOT est_voie ORDER BY adresses DESC, nom LIMIT 1
)
SELECT
  (SELECT count(*) FROM rues_noms)::INTEGER                                   AS noms,
  (SELECT count(*) FROM rues_noms WHERE est_voie)::INTEGER                    AS voies,
  (SELECT count(*) FROM rues_noms WHERE NOT est_voie)::INTEGER                AS lieux_dits,
  (SELECT count(*) FROM rues_adresses)::INTEGER                               AS adresses,
  (SELECT sum(adresses) FROM rues_noms WHERE NOT est_voie)::INTEGER           AS adresses_lieux_dits,
  (SELECT count(DISTINCT type_voie) FROM rues_noms WHERE est_voie)::INTEGER   AS types_de_voies,
  (SELECT nom FROM plus_peuplee)                                              AS voie_plus_peuplee,
  (SELECT adresses FROM plus_peuplee)::INTEGER                                AS voie_plus_peuplee_adresses,
  (SELECT nom FROM plus_peuplee_ld)                                           AS lieu_dit_plus_peuple,
  (SELECT adresses FROM plus_peuplee_ld)::INTEGER                             AS lieu_dit_plus_peuple_adresses,
  (SELECT count(*) FROM personnes)::INTEGER                                   AS voies_de_personnes,
  (SELECT count(DISTINCT sujet) FROM personnes)::INTEGER                      AS personnes_distinctes,
  (SELECT count(*) FROM personnes WHERE sexe = 'femme')::INTEGER              AS voies_femmes,
  (SELECT count(*) FROM personnes WHERE sexe = 'homme')::INTEGER              AS voies_hommes,
  (SELECT count(*) FROM personnes WHERE sexe NOT IN ('femme', 'homme'))::INTEGER AS voies_sexe_indetermine,
  (SELECT count(*) FROM personnes WHERE categorie = 'Non déterminé')::INTEGER AS voies_sans_categorie,
  (SELECT count(*) FROM read_csv('data/reference/noms-de-rues.csv', delim = ';', header = true, all_varchar = true))::INTEGER AS lignes_reference,
  (SELECT count(*) FROM rues_reference)::INTEGER                              AS lignes_reference_trouvees;
