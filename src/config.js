// src/config.js

// Basis-URL des Backends. Lokal läuft es auf Port 8081.
// Für die Produktion (Aufgabe c) später per .env-Datei überschreibbar (VITE_API_BASE).
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081'

// Deutsche Anzeige-Namen der Kategorien (Backend liefert z. B. "BREAKFAST").
// Hinweis: In Iteration 10a holen wir diese Labels dynamisch aus /api/category.
export const CATEGORY_LABELS = {
  BREAKFAST: 'Frühstück',
  LUNCH: 'Mittagessen',
  DINNER: 'Abendessen',
  SNACK: 'Snack',
  DESSERT: 'Nachtisch',
}
