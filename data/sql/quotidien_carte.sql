-- Points de la carte « vie quotidienne » à Luynes : défibrillateurs, points d'apport volontaire du verre et du textile, bancs.
-- Un défibrillateur est décrit par sa voie, sa position (extérieur / intérieur) et son accès (« 24 h/24 » si la base l'indique).
-- Résultat : src/data/generated/quotidien_carte.json (une ligne par point)
SELECT 'defibrillateurs' AS couche,
       coalesce(nullif(trim(voie), ''), 'Adresse non renseignée')
         || ' (' || CASE WHEN exterieur THEN 'extérieur' ELSE 'intérieur' END
         || CASE WHEN permanent THEN ', accès 24 h/24' ELSE ', accès permanent non indiqué' END || ')' AS libelle,
       lat, lon
FROM quotidien_dae WHERE code = '37139' AND NOT mobile AND lat IS NOT NULL
UNION ALL
SELECT 'verre', coalesce(nullif(trim(replace(replace(adresse, ', France', ''), ' 37230 LUYNES', ' Luynes')), ''), 'Adresse non renseignée'), lat, lon
FROM quotidien_verre WHERE code = '37139'
UNION ALL
SELECT 'textile', coalesce(nullif(trim(replace(geographic_address, ', France', '')), ''), name), geo_coordinates.lat::DOUBLE, geo_coordinates.lon::DOUBLE
FROM read_json('data/raw/quotidien_textile_luynes.json')
UNION ALL
SELECT 'bancs', 'Banc public', geo_point_2d.lat::DOUBLE, geo_point_2d.lon::DOUBLE
FROM read_json('data/raw/quotidien_bancs_luynes.json')
ORDER BY couche, libelle;
