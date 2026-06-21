<script setup>
import { useAuth0 } from '@auth0/auth0-vue'
import { useRoles } from '../composables/useRoles.js'

const { loginWithRedirect, logout } = useAuth0()
const { isAuthenticated, isAdmin, user } = useRoles()

function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('navbar-links-open')
}

async function login() {
  try {
    await loginWithRedirect()
  } catch (e) {
    console.error('[Auth0] Login fehlgeschlagen:', e)
  }
}

function doLogout() {
  logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })
}
</script>

<template>
  <header class="container" style="position: relative;">
    <nav class="navbar">
      <router-link to="/" class="navbar-brand">Nutri<span>Code</span></router-link>

      <button class="navbar-toggle" @click="toggleMenu">
        <span></span><span></span><span></span>
      </button>

      <ul class="navbar-links" id="nav-links">
        <li><router-link to="/">Startseite</router-link></li>
        <li><router-link to="/gerichte">Gerichte</router-link></li>
        <li><router-link :to="{ path: '/', hash: '#kontakt' }">Kontakt</router-link></li>

        <!-- Eingeloggt: Ernährungsplan, Profil (+ ggf. Admin) und Abmelden -->
        <template v-if="isAuthenticated">
          <li><router-link to="/ernaehrungsplan">Ernährungsplan</router-link></li>
          <li><router-link to="/profil">Profil</router-link></li>
          <li v-if="isAdmin"><router-link to="/admin">Admin-Bereich</router-link></li>
          <li v-if="isAdmin" class="navbar-badge">Admin</li>
          <li class="navbar-greeting">Hallo, {{ user?.name || user?.email }}</li>
          <li><button type="button" class="navbar-cta" @click="doLogout">Abmelden</button></li>
        </template>

        <!-- Nicht eingeloggt: Anmelden -->
        <template v-else>
          <li><button type="button" class="navbar-cta" @click="login">Anmelden</button></li>
        </template>
      </ul>

    </nav>
  </header>
</template>


<style scoped>
/* Navbar-spezifische Styles aus style.css hierher verschieben */

/* ==========================================================
   NAVBAR
   ========================================================== */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 0;
}

.navbar-brand {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  color: var(--color-primary-dark);
}

.navbar-brand span {
  color: var(--color-primary);
}

.navbar-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.navbar-links a {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6B6B6B;
}

.navbar-links a:hover {
  color: var(--color-primary-dark);
}

/* Anmelden-Button in der Navbar */
.navbar-cta {
  padding: 0.5rem 1.2rem;
  background-color: var(--color-primary);
  color: #ffffff !important;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
}

.navbar-cta:hover {
  background-color: var(--color-primary-dark);
}

/* Begrüßung + Rollen-Badge (eingeloggt) */
.navbar-greeting {
  display: flex;
  align-items: center;
  color: #6B6B6B;
  font-size: 0.85rem;
}

.navbar-badge {
  display: flex;
  align-items: center;
  background-color: rgba(124, 179, 66, 0.15);
  color: var(--color-primary-dark);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  text-transform: uppercase;
}

/* Hamburger-Button: nur auf Mobile sichtbar */
.navbar-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  flex-direction: column;
  gap: 5px;
}

.navbar-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background-color: #333333;
}

@media (max-width: 768px) {
  .navbar-links { display: none; }
  .navbar-toggle { display: flex; }
  .navbar-links-open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background-color: #ffffff;
    padding: 1.5rem;
    gap: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    z-index: 100;
  }
}


</style>
