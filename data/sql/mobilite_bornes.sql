-- Bornes de recharge pour véhicules électriques situées dans Luynes (base nationale IRVE).
-- Le code commune est souvent vide dans cette base : on garde les points situés à l'intérieur du contour de
-- la commune (extension « spatial », chargée par _spatial.sql). Une ligne de la base = un point de charge ;
-- une station = les points de charge à la même adresse et au même endroit.
-- Résultat : src/data/generated/mobilite_bornes.json (une ligne par station ; peut être vide → voir plus bas).
WITH points AS (
  SELECT unnest(data, recursive := true) FROM read_json('data/raw/bornes_recharge.json')
),
contour AS (
  SELECT ST_GeomFromGeoJSON(to_json(geometry)) AS g FROM read_json('data/raw/commune_contour.json')
)
SELECT
  -- Le nom affiché : l'enseigne ou l'opérateur, sans les codes techniques
  any_value(coalesce(nom_enseigne, nom_operateur))   AS operateur,
  any_value(adresse_station)                         AS adresse,
  count(*)::INTEGER                                  AS points_de_charge,
  max(puissance_nominale)::DOUBLE                    AS puissance_max_kw,  -- 0 = non renseignée
  bool_or(gratuit)                                   AS gratuit,
  any_value(implantation_station)                    AS implantation,
  any_value(coordonneesXY[2])::DOUBLE                AS lat,
  any_value(coordonneesXY[1])::DOUBLE                AS lon
FROM points, contour
WHERE ST_Contains(contour.g, ST_Point(coordonneesXY[1], coordonneesXY[2]))
GROUP BY adresse_station, coordonneesXY
-- Une ligne « vide » garantit un fichier non vide même s'il n'y a aucune borne (le site affiche alors « aucune »)
UNION ALL
SELECT NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM points, contour WHERE ST_Contains(contour.g, ST_Point(coordonneesXY[1], coordonneesXY[2])))
ORDER BY points_de_charge DESC;
