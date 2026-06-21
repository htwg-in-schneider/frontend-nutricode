// Zentrale Validierungsgrenzen des Frontends.
// Spiegelt die Backend-Grenzen aus ValidationLimits.java – beide müssen
// übereinstimmen (Frontend prüft vorab, das Backend prüft verbindlich).
export const LIMITS = {
  NAME_MAX: 100,
  DAYS_MIN: 1,
  DAYS_MAX: 7,
  CALORIES_MIN: 1,
  CALORIES_MAX: 10000,
}
