// Platzhalter-Bilder für Gerichte.
//
// Die Bilder liegen im separaten Static-Projekt (frontend-static-nutricode) unter
// public/images/meals und werden über GitHub Pages ausgeliefert. Wir verwenden sie
// als einheitliche Platzhalter für Gerichte, die kein eigenes Bild haben bzw. nur
// einen vom Backend gesetzten Auto-Platzhalter (picsum) tragen.
const PLACEHOLDER_BASE =
  'https://htwg-in-schneider.github.io/frontend-static-nutricode/images/meals/'

// Dateinamen exakt wie im Repo (GitHub Pages ist case-sensitive!)
const PLACEHOLDERS = ['Bowl.png', 'wrap.png', 'mealprep.png']

// Backend-Auto-Platzhalter (picsum) und leere URLs sollen durch unsere eigenen
// Bilder ersetzt werden; echte, vom Nutzer gesetzte Bild-URLs bleiben erhalten.
function isAutoPlaceholder(url) {
  return !url || url.includes('picsum.photos')
}

// Einfacher, stabiler String-Hash (für Gerichte ohne id, z. B. im Entwurf).
function hashString(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

// Deterministisches Platzhalter-Bild für ein Gericht: gleiches Gericht -> immer
// dasselbe Bild, über den Katalog hinweg gut verteilt.
export function mealPlaceholder(dish) {
  const seed = dish?.id != null ? Number(dish.id) : hashString(dish?.title || '')
  return PLACEHOLDER_BASE + PLACEHOLDERS[Math.abs(seed) % PLACEHOLDERS.length]
}

// Anzuzeigendes Bild eines Gerichts: echtes Bild bevorzugt, sonst Platzhalter.
export function dishImage(dish) {
  return isAutoPlaceholder(dish?.imageUrl) ? mealPlaceholder(dish) : dish.imageUrl
}
