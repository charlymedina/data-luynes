-- Tous les accidents corporels de Luynes, un par ligne, avec les informations publiées par l'ONISR (fichiers BAAC) :
-- date et heure, conditions, route, véhicules et personnes impliqués (rôle, sexe, âge, gravité, équipement).
-- L'adresse n'est pas reprise ; les coordonnées servent à la carte (NULL pour les accidents anciens non localisés).
-- Résultat : src/data/generated/accidents_liste.json
WITH vehicules AS (
  -- véhicules de chaque accident : « 2 voitures, moto ou scooter »
  SELECT num_acc, string_agg(CASE WHEN n > 1 THEN n || ' × ' || vehicule ELSE vehicule END, ', ' ORDER BY n DESC, vehicule) AS vehicules
  FROM (SELECT num_acc, vehicule, count(*) AS n FROM accidents_vehicules WHERE vehicule IS NOT NULL GROUP BY ALL)
  GROUP BY num_acc
),

personnes AS (
  -- une ligne de texte par personne : « conducteur · voiture · homme, 34 ans · blessé léger · ceinture »
  SELECT
    num_acc,
    list(
      concat_ws(' · ',
        role,
        CASE WHEN role <> 'piéton' THEN vehicule END,
        nullif(concat_ws(', ', sexe, CASE WHEN age IS NOT NULL THEN age || ' ans' END), ''),
        gravite,
        equipement
      )
      ORDER BY CASE role WHEN 'piéton' THEN 0 WHEN 'conducteur' THEN 1 ELSE 2 END, num_veh
    ) AS personnes
  FROM accidents_usagers_detail
  GROUP BY num_acc
)

SELECT
  c.annee,
  c.mois,                                                    -- 1 = janvier … 12 = décembre
  c.jour,
  c.jour_semaine::INTEGER                        AS jour_semaine, -- 1 = lundi … 7 = dimanche
  c.heure,
  c.minute,
  c.moment,
  c.lumiere,
  c.meteo_libelle                                AS meteo,
  c.route,
  c.type_route,
  c.vitesse_max,                                             -- km/h, publiée depuis 2019 seulement
  c.etat_chaussee,
  c.intersection_libelle                         AS intersection,
  c.collision_libelle                            AS collision,
  c.agglomeration_libelle                        AS agglomeration,
  c.gravite,
  c.tues::INTEGER                                AS tues,
  c.hospitalises::INTEGER                        AS hospitalises,
  c.blesses_legers::INTEGER                      AS blesses_legers,
  v.vehicules,
  coalesce(p.personnes, [])                      AS personnes,
  round(c.lat, 5)                                AS lat,
  round(c.lon, 5)                                AS lon
FROM accidents_complet c
LEFT JOIN vehicules v USING (num_acc)
LEFT JOIN personnes p USING (num_acc)
WHERE c.est_luynes
ORDER BY c.annee, c.mois, c.jour, c.heure, c.minute;
