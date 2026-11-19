-- Toutes les ventes immobilières de Luynes (une ligne par vente), pour la carte et le tableau de la page Immobilier.
-- L'adresse est donnée au niveau de la rue seulement (sans numéro) ; DVF ne contient aucun nom de personne.
-- Résultat : src/data/generated/immobilier_ventes.json, servi aussi à la carte via /donnees/ventes-immobilieres.json.
SELECT
  id_mutation                        AS id,
  strftime(date_vente, '%Y-%m-%d')   AS date,
  year(date_vente)::INTEGER          AS annee,
  type_bien                          AS type,
  round(prix)::INTEGER               AS prix,
  round(surface_bati)::INTEGER       AS surface_bati,
  round(surface_terrain)::INTEGER    AS surface_terrain,
  pieces::INTEGER                    AS pieces,
  round(prix_m2)::INTEGER            AS prix_m2,
  rue,                                                -- en majuscules dans DVF, mis en forme côté site
  round(lat, 5)::DOUBLE              AS lat,
  round(lon, 5)::DOUBLE              AS lon
FROM dvf_ventes_prix
WHERE code_commune = '37139'
  AND lat IS NOT NULL               -- quelques ventes ne sont pas géolocalisées : elles restent dans les totaux
ORDER BY date_vente DESC, prix DESC;
