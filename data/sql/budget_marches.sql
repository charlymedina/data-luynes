-- Marchés publics attribués par la mairie (données essentielles de la commande publique), du plus récent au plus ancien.
-- ⚠️ « plafond » est le montant maximum du contrat (souvent une valeur technique d'accord-cadre), PAS une dépense :
-- ces montants ne doivent jamais être additionnés.
-- Résultat : src/data/generated/budget_marches.json
SELECT
  id,
  objet,
  titulaire_nom        AS titulaire,
  titulaire_commune_nom AS ville_titulaire,
  procedure,
  dateNotification     AS date_notification,
  datePublicationDonnees AS date_publication,
  montant              AS plafond,
  dureeMois            AS duree_mois
FROM marches
ORDER BY dateNotification DESC, id;
