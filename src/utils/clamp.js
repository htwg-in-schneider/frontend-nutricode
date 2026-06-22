/**
 * Begrenzt eine Zahleneingabe auf den Bereich [min, max] und rundet
 * Ganzzahlfelder. Wird an Zahlen-Inputs (@change, also beim Verlassen des
 * Feldes) gebunden, damit nur plausible Werte im Formular landen – denn die
 * nativen HTML-Attribute min/max verhindern das Eintippen ungültiger Werte
 * NICHT, sie markieren sie nur beim Absenden. Verbindlich geprüft wird ohnehin
 * im Backend (ValidationLimits).
 *
 * Leere Eingaben bleiben leer (null), damit optionale Felder optional bleiben.
 *
 * @param {number|string|null} value  aktueller Eingabewert
 * @param {number} min                untere Grenze (inklusive)
 * @param {number} max                obere Grenze (inklusive)
 * @param {{ integer?: boolean }} [opts]  integer=true rundet auf ganze Zahlen
 * @returns {number|null}
 */
export function clampNumber(value, min, max, { integer = true } = {}) {
  if (value === '' || value === null || value === undefined) return null
  let n = Number(value)
  if (Number.isNaN(n)) return null
  if (integer) n = Math.round(n)
  return Math.min(max, Math.max(min, n))
}
