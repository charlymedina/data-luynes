-- Observations GBIF à Luynes par grand groupe du vivant (oiseaux, plantes à fleurs, insectes…).
-- Les groupes sont les « classes » de la taxonomie GBIF (clés fixes) ; la table ci-dessous donne le nom courant.
-- Ceux qui ne sont pas listés (rares) sont regroupés dans « Autres ».
-- Résultat : src/data/generated/nature_biodiversite_groupes.json
WITH noms(cle, groupe, regne) AS (
  VALUES
    ('212',      'Oiseaux',                'animaux'),
    ('216',      'Insectes',               'animaux'),
    ('359',      'Mammifères',             'animaux'),
    ('131',      'Amphibiens',             'animaux'),
    ('11592253', 'Lézards et serpents',    'animaux'),
    ('220',      'Plantes à fleurs',       'plantes'),
    ('196',      'Plantes à fleurs',       'plantes'),
    ('7228684',  'Fougères',               'plantes'),
    ('327',      'Mousses',                'plantes')
),
classes AS (SELECT valeur AS cle, observations FROM nature_gbif_facette('data/raw/nature_gbif_resume.json', 'CLASS_KEY')),
total AS (SELECT count::INTEGER AS observations FROM read_json('data/raw/nature_gbif_resume.json'))
SELECT
  coalesce(n.groupe, 'Autres') AS groupe,
  coalesce(n.regne, 'autres')  AS regne,
  sum(c.observations)::INTEGER AS observations,
  round(100.0 * sum(c.observations) / any_value(t.observations), 1)::DOUBLE AS part_pct
FROM classes c LEFT JOIN noms n USING (cle), total t
GROUP BY 1, 2
ORDER BY (coalesce(n.groupe, 'Autres') = 'Autres'), observations DESC;
