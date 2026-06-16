import { computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

// Namespace-Claim, in dem Auth0 die Rollen ablegt (siehe post-login Action)
const ROLES_NAMESPACE = import.meta.env.VITE_AUTH0_ROLES_NAMESPACE

/**
 * Komfort-Composable für Rollen-Abfragen im Frontend.
 * Die Rollen kommen aus dem ID-Token (custom claim), das Auth0 nach dem Login liefert.
 */
export function useRoles() {
  const { user, isAuthenticated, isLoading } = useAuth0()

  const roles = computed(() => {
    if (!user.value) return []
    return user.value[ROLES_NAMESPACE] || []
  })

  const isAdmin = computed(() => roles.value.includes('ADMIN'))

  return { roles, isAdmin, isAuthenticated, isLoading, user }
}
