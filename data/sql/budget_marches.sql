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
  -- Valeur « technique » de plafond d'accord-cadre : que des 9 (999 999 €) ou un million divisé par 1,1 (909 090 €).
  -- Ce n'est ni une estimation ni une dépense : le site le précise à côté du montant.
  (regexp_matches(CAST(CAST(floor(montant) AS BIGINT) AS VARCHAR), '^9{5,}$')
    OR (montant * 1.1 >= 500000 AND abs(montant * 1.1 - round(montant * 1.1 / 1000000) * 1000000) <= 1.5)) AS plafond_technique,
  dureeMois            AS duree_mois
FROM marches
ORDER BY dateNotification DESC, id;
