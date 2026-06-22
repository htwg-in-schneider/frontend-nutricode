// Konstanten für die Kalorienberechnung (Mifflin-St-Jeor). Die Enum-Schlüssel
// (MALE/FEMALE, SEDENTARY …) entsprechen den Backend-Enums Sex / ActivityLevel.

// Geschlecht (die Mifflin-Formel unterscheidet nur männlich/weiblich).
export const SEX_OPTIONS = [
  { key: 'MALE', label: 'Männlich' },
  { key: 'FEMALE', label: 'Weiblich' },
]

// Aktivitätslevel mit dem zugehörigen Faktor für den Tagesbedarf (TDEE).
export const ACTIVITY_LEVELS = [
  { key: 'SEDENTARY', label: 'Wenig aktiv (kaum Sport)', factor: 1.2 },
  { key: 'LIGHT', label: 'Leicht aktiv (1–3×/Woche)', factor: 1.375 },
  { key: 'MODERATE', label: 'Mäßig aktiv (3–5×/Woche)', factor: 1.55 },
  { key: 'ACTIVE', label: 'Sehr aktiv (6–7×/Woche)', factor: 1.725 },
  { key: 'VERY_ACTIVE', label: 'Extrem aktiv (Leistungssport)', factor: 1.9 },
]

// Anpassung der Zielkalorien je Ziel (kcal/Tag auf den Tagesbedarf).
export const GOAL_CALORIE_DELTA = {
  LOSE_WEIGHT: -500,
  MAINTAIN: 0,
  GAIN_MUSCLE: 300,
}

// Geschmacks-/Ernährungs-Vorlieben für die KI-Gerichtegenerierung.
// Jede Frage hat "Egal" als Standard, damit man nicht alles durchklicken muss.
export const DISH_PREFERENCES = [
  { key: 'cuisine', label: 'Küchenstil', options: ['Egal', 'Asiatisch', 'Mediterran', 'Deutsch / Hausmannskost', 'Mexikanisch', 'Indisch'] },
  { key: 'diet', label: 'Ernährungsform', options: ['Egal', 'Vegetarisch', 'Vegan', 'Alles (Fleisch & Fisch)', 'Low-Carb', 'High-Protein'] },
  { key: 'meat', label: 'Fleisch', options: ['Egal', 'Gerne viel', 'Eher wenig', 'Kein Fleisch'] },
  { key: 'fish', label: 'Fisch', options: ['Egal', 'Gerne', 'Kein Fisch'] },
  { key: 'vegetables', label: 'Gemüse', options: ['Egal', 'Gerne viel', 'Eher wenig'] },
  { key: 'fruit', label: 'Obst', options: ['Egal', 'Gerne viel', 'Eher wenig'] },
]
