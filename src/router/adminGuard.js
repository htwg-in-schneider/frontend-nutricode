import { authGuard } from '@auth0/auth0-vue'
import { auth0 } from '../auth/auth0.js'

// Namespace-Claim, in dem Auth0 die Rollen ablegt (siehe post-login Action)
const ROLES_NAMESPACE = import.meta.env.VITE_AUTH0_ROLES_NAMESPACE

/**
 * Route-Guard für den Admin-Bereich:
 * 1. authGuard stellt sicher, dass der Nutzer eingeloggt ist (sonst Login-Redirect).
 * 2. Anschließend wird die ADMIN-Rolle aus dem Token geprüft.
 * Eingeloggte Nicht-Admins werden auf die Startseite umgeleitet.
 *
 * Hinweis: Das ist nur die UX-Absicherung. Verbindlich geschützt ist der
 * Admin-Bereich im Backend über hasRole("ADMIN").
 */
export async function adminGuard(to) {
  const authenticated = await authGuard(to)
  if (authenticated !== true) {
    // Nicht eingeloggt -> authGuard hat den Login-Redirect bereits ausgelöst
    return authenticated
  }

  const roles = auth0.user.value?.[ROLES_NAMESPACE] || []
  return roles.includes('ADMIN') ? true : { name: 'home' }
}
