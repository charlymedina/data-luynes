-- Les cantines de Luynes (dernière année déclarée sur « Ma Cantine ») : part de produits bio et de produits durables
-- et de qualité (bio + autres labels EGalim). Les objectifs légaux (20 % de bio, 50 % de durable) sont dans la page.
-- Résultat : src/data/generated/equipements_cantines.json (une ligne par cantine)
SELECT annee, nom, secteur, ecole,
       round(bio_pct, 1)::DOUBLE     AS bio_pct,
       round(durable_pct, 1)::DOUBLE AS durable_pct
FROM cantines
WHERE annee = (SELECT max(annee) FROM cantines)
ORDER BY ecole DESC, nom;
