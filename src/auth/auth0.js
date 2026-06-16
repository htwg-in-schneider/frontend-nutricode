import { createAuth0 } from '@auth0/auth0-vue'

// Diagnose: warnt, falls die .env nicht geladen wurde (Dev-Server nicht neu gestartet)
if (!import.meta.env.VITE_AUTH0_DOMAIN || !import.meta.env.VITE_AUTH0_CLIENT_ID) {
  console.error('[Auth0] VITE_AUTH0_DOMAIN/CLIENT_ID fehlt – läuft der Dev-Server seit dem Anlegen der .env? Bitte "npm run dev" neu starten.')
} else {
  console.info('[Auth0] config:', {
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    redirect_uri: window.location.origin + import.meta.env.BASE_URL,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  })
}

// Zentrale Auth0-Instanz. Wird in main.js als Vue-Plugin registriert UND in den
// Router-Guards (adminGuard) verwendet, um die Rollen außerhalb des Setup-Kontexts
// zu prüfen. Eigenes Modul, damit kein Zirkel-Import (main.js <-> router) entsteht.
// redirect_uri zeigt auf die App selbst (inkl. Vite-base).
export const auth0 = createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin + import.meta.env.BASE_URL,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  },
  // localstorage + Refresh-Tokens: robuster gegen blockierte Third-Party-Cookies
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
})
