#!/usr/bin/env bash
# Ouvre (ou met à jour) l'issue GitHub « Alerte sources de données » à partir de data/raw/_alertes.md,
# écrit par scripts/build-data.ts seulement s'il y a des alertes. Nécessite `gh` (avec GH_TOKEN).
# Une seule issue ouverte à la fois (étiquette « alerte-donnees ») : si elle existe, son contenu est remplacé et un
# commentaire prévient (GitHub envoie alors un e-mail) ; si la liste est identique, rien n'est modifié.
set -euo pipefail

CORPS="${1:-data/raw/_alertes.md}"
ETIQUETTE="alerte-donnees"
TITRE="Alerte sources de données"

if [ ! -s "$CORPS" ]; then
  echo "Aucune alerte sur les sources."
  exit 0
fi

gh label create "$ETIQUETTE" --description "Variation brutale d'une source de données" --color D93F0B --force >/dev/null

EXISTANTE="$(gh issue list --label "$ETIQUETTE" --state open --json number --jq '.[0].number // empty')"
if [ -z "$EXISTANTE" ]; then
  gh issue create --title "$TITRE" --label "$ETIQUETTE" --body-file "$CORPS"
  exit 0
fi

ACTUEL="$(gh issue view "$EXISTANTE" --json body --jq .body | tr -d "\r")"
if [ "$ACTUEL" = "$(cat "$CORPS")" ]; then
  echo "Issue #$EXISTANTE déjà à jour."
  exit 0
fi
gh issue edit "$EXISTANTE" --body-file "$CORPS"
gh issue comment "$EXISTANTE" --body "Liste des alertes mise à jour (voir la description)."
