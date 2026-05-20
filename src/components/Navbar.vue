<script setup>
import { ref, onMounted } from 'vue'
import { API_BASE } from '../config.js'

const categories = ref([])

onMounted(async () => {
  try {
    const response = await fetch(`${API_BASE}/api/category`)
    categories.value = await response.json()
  } catch (err) {
    console.error('Kategorien konnten nicht geladen werden', err)
  }
})

function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('navbar-links-open')
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
        <li v-for="cat in categories" :key="cat.name">
          <router-link :to="{ path: '/gerichte', query: { category: cat.name } }">
            {{ cat.label }}
          </router-link>
        </li>
        <li><a href="#" class="navbar-cta">Anmelden</a></li>
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
  color: #558B2F;
}

.navbar-brand span {
  color: #7CB342;
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
  color: #558B2F;
}

/* Anmelden-Button in der Navbar */
.navbar-cta {
  padding: 0.5rem 1.2rem;
  background-color: #7CB342;
  color: #ffffff !important;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
}

.navbar-cta:hover {
  background-color: #558B2F;
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
