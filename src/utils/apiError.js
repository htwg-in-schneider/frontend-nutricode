/**
 * Liest eine verständliche Fehlermeldung aus einer fehlgeschlagenen API-Antwort.
 *
 * Das Backend antwortet bei ungültigen/fehlenden Eingaben mit HTTP 400 und
 * entweder { "error": "..." } (manuelle Prüfung / ResponseStatusException)
 * oder { "feld": "Meldung", ... } (Bean-Validation pro Feld). Diese Funktion
 * fasst das zu einem anzeigbaren Text zusammen.
 */
export async function readApiError(res, fallback = 'Es ist ein Fehler aufgetreten.') {
  try {
    const data = await res.json()
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object') {
      if (data.error) return data.error
      if (data.message) return data.message
      const msgs = Object.values(data).filter((v) => typeof v === 'string')
      if (msgs.length) return msgs.join(' ')
    }
  } catch (e) {
    // Antwort enthielt kein JSON – Standardmeldung verwenden
  }
  return fallback
}
