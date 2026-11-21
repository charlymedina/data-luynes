-- Les équipements sportifs de Luynes, un par ligne (carte et liste). Position vide = équipement recensé sans coordonnées.
-- Résultat : src/data/generated/sport_equipements_liste.json
SELECT
  id,
  nom,
  installation,
  adresse,
  type,
  annee_service::INTEGER AS annee_service,
  periode_service,
  annee_travaux::INTEGER AS annee_travaux,
  lat,
  lon,
  nature,
  ouvert_public,
  acces_libre,
  installation_accessible,
  hors_service
FROM sport_equipements
ORDER BY installation, nom, id;
