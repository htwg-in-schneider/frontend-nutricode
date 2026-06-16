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

// ===== Ernährungsplan-Wizard (komplexer Vorgang) =====

// Ziele eines Ernährungsplans (Schritt 1)
export const GOAL_LABELS = {
  LOSE_WEIGHT: 'Abnehmen',
  MAINTAIN: 'Gewicht halten',
  GAIN_MUSCLE: 'Muskelaufbau',
}

// Status eines Plans im mehrstufigen Vorgang
export const PLAN_STATUS_LABELS = {
  DRAFT: 'Entwurf',
  COMPLETED: 'Abgeschlossen',
}

// Feste Tagesstruktur: drei Mahlzeiten je Tag (Schritt 3)
export const MEAL_SLOTS = [
  { key: 'BREAKFAST', label: 'Frühstück' },
  { key: 'LUNCH', label: 'Mittagessen' },
  { key: 'DINNER', label: 'Abendessen' },
]
