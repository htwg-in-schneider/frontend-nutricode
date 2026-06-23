// Platzhalter-Bilder für Gerichte.
//
// Die Bilder liegen im separaten Static-Projekt (frontend-static-nutricode) unter
// public/images/meals und werden über GitHub Pages ausgeliefert. Wir verwenden sie
// als einheitliche Platzhalter für Gerichte, die kein eigenes Bild haben bzw. nur
// einen vom Backend gesetzten Auto-Platzhalter (picsum) tragen.
const PLACEHOLDER_BASE =
  'https://htwg-in-schneider.github.io/frontend-static-nutricode/images/meals/'

// Passendes Bild anhand von Stichwörtern im Gerichtnamen wählen (z. B. ein
// "Wrap"-Gericht bekommt wrap.png). Reihenfolge = Priorität; greift kein
// Stichwort, kommt das generische Meal-Prep-Bild zum Einsatz.
// Dateinamen exakt wie im Repo – GitHub Pages ist case-sensitive!
const KEYWORD_IMAGES = [
  { image: 'wrap.png', keywords: ['wrap', 'burrito', 'tortilla'] },
  {
    image: 'Bowl.png',
    keywords: [
      'bowl', 'smoothie', 'müsli', 'muesli', 'porridge', 'oats', 'haferflocken',
      'haferbrei', 'joghurt', 'yoghurt', 'yogurt', 'quark', 'salat', 'salad',
      'suppe', 'poke',
    ],
  },
]
const DEFAULT_IMAGE = 'mealprep.png'

// Backend-Auto-Platzhalter (picsum) und leere URLs sollen durch unsere eigenen
// Bilder ersetzt werden; echte, vom Nutzer gesetzte Bild-URLs bleiben erhalten.
function isAutoPlaceholder(url) {
  return !url || url.includes('picsum.photos')
}

// Thematisch passendes Platzhalter-Bild für ein Gericht (anhand des Namens).
export function mealPlaceholder(dish) {
  const text = (dish?.title || '').toLowerCase()
  for (const { image, keywords } of KEYWORD_IMAGES) {
    if (keywords.some((k) => text.includes(k))) return PLACEHOLDER_BASE + image
  }
  return PLACEHOLDER_BASE + DEFAULT_IMAGE
}

// Anzuzeigendes Bild eines Gerichts: echtes Bild bevorzugt, sonst Platzhalter.
export function dishImage(dish) {
  return isAutoPlaceholder(dish?.imageUrl) ? mealPlaceholder(dish) : dish.imageUrl
}
