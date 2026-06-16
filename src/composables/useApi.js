import { useAuth0 } from '@auth0/auth0-vue'
import { API_BASE } from '../config.js'

/**
 * Liefert eine apiFetch-Funktion, die bei eingeloggten Nutzern automatisch
 * den Auth0-Bearer-Token an die Backend-Anfrage anhängt. Ohne Login wird
 * ganz normal (ohne Token) angefragt – für die öffentlichen GET-Endpunkte.
 *
 * Aufruf mit relativem Pfad, z. B. apiFetch('/api/dish', { method: 'POST', ... }).
 */
export function useApi() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  async function apiFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) }

    if (isAuthenticated.value) {
      try {
        const token = await getAccessTokenSilently()
        headers.Authorization = `Bearer ${token}`
      } catch (e) {
        // Kein gültiger Token verfügbar -> ohne Token fortfahren
      }
    }

    return fetch(`${API_BASE}${path}`, { ...options, headers })
  }

  return { apiFetch }
}
