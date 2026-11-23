-- Tests des aides de la CAF et de l'âge du bâti (BD TOPO + recensement) : cohérence et plausibilité. Zéro ligne = tout va bien.

-- ── CAF ──────────────────────────────────────────────────────────────────────────────────────────
SELECT 'caf : part de ménages hors de 0-100 % (' || part_menages || ')' AS probleme
FROM revenus_caf_resume WHERE part_menages NOT BETWEEN 1 AND 100

UNION ALL
SELECT 'caf : foyers non arrondis à 5 (' || foyers || ') : la CAF arrondit toujours' FROM revenus_caf_resume WHERE foyers % 5 <> 0

UNION ALL
SELECT 'caf : classement incohérent (' || rang || ' sur ' || nb_communes || ')'
FROM revenus_caf_resume WHERE rang NOT BETWEEN 1 AND nb_communes OR nb_communes < 200

UNION ALL
SELECT 'caf : plus de foyers allocataires (' || foyers || ') que de ménages (' || menages || ')' FROM revenus_caf_resume WHERE foyers > menages

UNION ALL
SELECT 'caf : une prestation (' || p.code || ', ' || p.foyers || ' foyers) dépasse le total des foyers allocataires (' || r.foyers || ')'
FROM revenus_caf_prestations p, revenus_caf_resume r WHERE p.foyers > r.foyers

UNION ALL
-- Les allocations familiales font partie des prestations pour les familles : elles ne peuvent pas les dépasser (à l'arrondi près)
SELECT 'caf : allocations familiales (' || af.foyers || ') > prestations familles (' || fa.foyers || ')'
FROM revenus_caf_prestations af, revenus_caf_prestations fa WHERE af.code = 'af' AND fa.code = 'ndurej' AND af.foyers > fa.foyers + 5

UNION ALL
-- Valeur masquée = 0 foyer et 0 % ; un 0 ne doit jamais être présenté comme une vraie mesure sans le drapeau
SELECT 'caf : masque incohérent pour ' || code FROM revenus_caf_prestations WHERE masque <> (foyers = 0) OR (masque AND part_menages <> 0)

UNION ALL
SELECT 'caf : part de ménages implausible pour ' || code || ' (' || part_menages || ' %)' FROM revenus_caf_prestations WHERE part_menages NOT BETWEEN 0 AND 100

UNION ALL
SELECT 'caf : aucune prestation trouvée' FROM (SELECT count(*) AS n FROM revenus_caf_prestations) WHERE n = 0

UNION ALL
SELECT 'caf : la première année d''évolution doit valoir 0 (' || evolution_pct || ')'
FROM revenus_caf_annees WHERE annee = (SELECT min(annee) FROM revenus_caf_annees) AND (evolution_pct <> 0 OR evolution_37_pct <> 0)

UNION ALL
SELECT 'caf : évolution aberrante en ' || annee || ' (' || evolution_pct || ' %)' FROM revenus_caf_annees WHERE abs(evolution_pct) > 50 OR abs(evolution_37_pct) > 50

UNION ALL
-- Le dernier point de la courbe doit être le chiffre du résumé
SELECT 'caf : dernier point de la courbe (' || a.foyers || ') ≠ résumé (' || r.foyers || ')'
FROM revenus_caf_annees a, revenus_caf_resume r WHERE a.annee = r.annee AND a.foyers <> r.foyers

UNION ALL
-- ── Âge du bâti ─────────────────────────────────────────────────────────────────────────────────
SELECT 'bâti : nombre de bâtiments implausible (' || batiments || ')' FROM patrimoine_bati_resume WHERE batiments NOT BETWEEN 1000 AND 20000

UNION ALL
SELECT 'bâti : plus de bâtiments datés que de bâtiments' FROM patrimoine_bati_resume WHERE batiments_dates > batiments OR residentiels_dates > residentiels

UNION ALL
SELECT 'bâti : année la plus ancienne implausible (' || plus_ancien_annee || ')' FROM patrimoine_bati_resume WHERE plus_ancien_annee NOT BETWEEN 1000 AND 2030

UNION ALL
SELECT 'bâti : année la plus récente dans le futur (' || plus_recent_annee || ')' FROM patrimoine_bati_resume WHERE plus_recent_annee > year(current_date)

UNION ALL
SELECT 'bâti : hauteur maximale implausible (' || hauteur_max || ' m)' FROM patrimoine_bati_resume WHERE hauteur_max NOT BETWEEN 3 AND 150

UNION ALL
SELECT 'bâti : part de bâtiments datés hors de 0-100 %' FROM patrimoine_bati_resume WHERE part_dates_pct NOT BETWEEN 0 AND 100

UNION ALL
-- Chaque habitation datée doit être rangée dans une période (aucun trou entre les bornes)
SELECT 'bâti : ' || s.n || ' habitations dans les périodes, ' || r.residentiels_dates || ' datées'
FROM (SELECT sum(batiments) AS n FROM patrimoine_bati_periodes) s, patrimoine_bati_resume r WHERE s.n <> r.residentiels_dates

UNION ALL
SELECT 'bâti : les parts du recensement font ' || round(sum(part_logements_pct)) || ' % (≠ 100)' FROM patrimoine_bati_periodes HAVING abs(sum(part_logements_pct) - 100) > 1

UNION ALL
SELECT 'bâti : les parts BD TOPO font ' || round(sum(part_batiments_pct)) || ' % (≠ 100)' FROM patrimoine_bati_periodes HAVING abs(sum(part_batiments_pct) - 100) > 1

UNION ALL
-- Les périodes doivent être dans l'ordre chronologique, avec au moins 4 tranches
SELECT 'bâti : périodes insuffisantes (' || count(*) || ')' FROM patrimoine_bati_periodes HAVING count(*) < 4;
