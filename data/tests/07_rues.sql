-- Tests du thème « Les rues de Luynes » : cohérence de la BAN et de la table de correspondance des noms. Zéro ligne = tout va bien.

-- Les totaux se recoupent : voies + lieux-dits = noms ; adresses des classements = adresses de la base.
SELECT 'rues : ' || voies || ' voies + ' || lieux_dits || ' lieux-dits ≠ ' || noms || ' noms' AS probleme
FROM rues_resume WHERE voies + lieux_dits <> noms

UNION ALL
SELECT 'rues : ' || (SELECT sum(adresses) FROM rues_types) || ' adresses par type pour ' || adresses || ' au total'
FROM rues_resume WHERE adresses <> (SELECT sum(adresses) FROM rues_types)

UNION ALL
SELECT 'rues : ' || count(*) || ' points sur la carte pour ' || r.noms || ' noms'
FROM rues_carte, rues_resume r GROUP BY r.noms HAVING count(*) <> r.noms

-- Valeurs plausibles pour une commune de ≈ 5 000 habitants.
UNION ALL
SELECT 'rues : nombre de noms implausible (' || noms || ')' FROM rues_resume WHERE noms NOT BETWEEN 50 AND 600

UNION ALL
SELECT 'rues : nombre d''adresses implausible (' || adresses || ')' FROM rues_resume WHERE adresses NOT BETWEEN 500 AND 8000

-- Les positions sont bien à Luynes (et pas à Fondettes ou à Tours).
UNION ALL
SELECT 'rues : adresse hors de Luynes (' || nom || ', ' || lat || ', ' || lon || ')'
FROM rues_carte WHERE lat NOT BETWEEN 47.30 AND 47.46 OR lon NOT BETWEEN 0.40 AND 0.70

-- Table de correspondance (data/reference/noms-de-rues.csv) : valeurs autorisées, une catégorie pour chaque personne, et la grande majorité des noms retrouvés
-- (si la BAN renomme beaucoup de voies, la table est à revoir).
UNION ALL
SELECT 'rues : sexe inconnu dans la table de correspondance (' || nom || ' : ' || sexe || ')'
FROM rues_personnes WHERE sexe NOT IN ('homme', 'femme', 'indetermine')

UNION ALL
SELECT 'rues : catégorie manquante pour ' || nom FROM rues_personnes WHERE coalesce(categorie, '') = ''

UNION ALL
SELECT 'rues : seulement ' || lignes_reference_trouvees || ' noms de la table de correspondance retrouvés sur ' || lignes_reference || ' (la BAN a-t-elle renommé des voies ?)'
FROM rues_resume WHERE lignes_reference_trouvees < 0.8 * lignes_reference

UNION ALL
SELECT 'rues : ' || (r.voies_femmes + r.voies_hommes + r.voies_sexe_indetermine) || ' voies par sexe pour ' || r.voies_de_personnes || ' voies de personnes'
FROM rues_resume r WHERE r.voies_femmes + r.voies_hommes + r.voies_sexe_indetermine <> r.voies_de_personnes

UNION ALL
SELECT 'rues : ' || sum(rues_categories.voies) || ' voies par catégorie pour ' || r.voies_de_personnes || ' voies de personnes'
FROM rues_categories, rues_resume r GROUP BY r.voies_de_personnes HAVING sum(rues_categories.voies) <> r.voies_de_personnes;
