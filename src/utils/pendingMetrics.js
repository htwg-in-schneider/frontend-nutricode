// Zwischenspeicher für die im öffentlichen Kalorienrechner eingegebenen
// Körperdaten, falls dort "Ernährungsplan erstellen" geklickt wird, ohne dass
// der Nutzer eingeloggt ist. Der Auth0-Login löst einen kompletten Seiten-
// Redirect aus – der Vue-Komponentenzustand (das Formular) überlebt das nicht.
// Daher legen wir die Werte kurz im localStorage ab und übernehmen sie nach
// dem Login einmalig ins Profil.

const KEY = 'nutricode.pendingMetrics'
const TTL_MS = 60 * 60 * 1000 // 1 Stunde – danach gilt der Eintrag als veraltet

// Körperdaten zwischenspeichern (mit Zeitstempel für die TTL-Prüfung).
export function stashPendingMetrics(metrics) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ metrics, savedAt: Date.now() }))
  } catch (e) {
    // localStorage kann (z. B. im Privatmodus) fehlschlagen – dann ohne Übernahme
  }
}

// Zwischengespeicherte Werte EINMALIG zurückgeben (und dabei löschen).
// Liefert null, wenn nichts vorliegt oder der Eintrag älter als die TTL ist.
export function popPendingMetrics() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    localStorage.removeItem(KEY)
    const { metrics, savedAt } = JSON.parse(raw)
    if (!metrics || !savedAt || Date.now() - savedAt > TTL_MS) return null
    return metrics
  } catch (e) {
    return null
  }
}
