// Applique le thème choisi avec le bouton avant l'affichage (évite un flash de l'autre thème).
// Fichier séparé (et non script dans la page) pour respecter la politique de sécurité : aucun script inline autorisé.
try {
  const theme = localStorage.getItem('theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch {}
