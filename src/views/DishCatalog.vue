<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DishCard from '../components/DishCard.vue'
import DishFilter from '../components/DishFilter.vue'
import { useApi } from '../composables/useApi.js'
import { useRoles } from '../composables/useRoles.js'

const route = useRoute()
const { apiFetch } = useApi()
const { isAuthenticated, isAdmin, isLoading } = useRoles()

const dishes = ref([])
const error = ref(null)

async function fetchDishes(params = {}) {
  try {
    const query = new URLSearchParams()
    if (params.name) query.append('name', params.name)
    if (params.category) query.append('category', params.category)
    const path = query.toString() ? `/api/dish?${query.toString()}` : '/api/dish'

    // apiFetch hängt bei eingeloggten Nutzer:innen automatisch das Token an ->
    // das Backend liefert dann die persönlichen Gerichte statt der globalen Vorlagen.
    const response = await apiFetch(path)
    if (!response.ok) throw new Error('Fehler beim Laden der Gerichte')
    dishes.value = await response.json()
    error.value = null
  } catch (err) {
    error.value = err.message
  }
}

// Erst laden, wenn Auth0 fertig initialisiert ist (sonst ginge der erste Request
// ohne Token raus). Reagiert zusätzlich auf Login/Logout, damit zwischen den
// globalen Vorlagen und den eigenen Gerichten umgeschaltet wird.
watch(
  [isLoading, isAuthenticated],
  ([loading]) => {
    if (loading) return
    fetchDishes({ category: route.query.category || '' })
  },
  { immediate: true }
)

// Kategorie-Navigation aus der Navbar (?category=...)
watch(
  () => route.query.category,
  (category) => {
    if (isLoading.value) return
    fetchDishes({ category: category || '' })
  }
)
</script>

<template>
  <section class="dish-catalog container">
    <div class="section-header">
      <p class="section-tag">Rezepte</p>
      <h2 class="section-title">
        {{ !isAuthenticated ? 'Unsere Gerichte' : (isAdmin ? 'Vorlagen-Gerichte' : 'Meine Gerichte') }}
      </h2>
    </div>

    <!-- Kontext-Hinweis je nach Rolle: erklärt die globale vs. persönliche Sicht -->
    <p v-if="isAuthenticated" class="catalog-hint">
      <template v-if="isAdmin">
        Als <strong>Administrator:in</strong> pflegst du hier die globalen
        Vorlagen-Gerichte – sie dienen allen neuen Nutzer:innen als Startbestand.
      </template>
      <template v-else>
        Das sind <strong>deine</strong> Gerichte. Änderungen, neue Gerichte und
        Löschungen betreffen nur dich – andere Nutzer:innen sehen sie nicht.
      </template>
    </p>

    <div v-if="isAuthenticated" class="catalog-actions">
      <router-link to="/dish/new" class="btn btn-accent">+ Neues Gericht</router-link>
    </div>

    <DishFilter @search="fetchDishes" />

    <p v-if="error" class="dish-error">{{ error }}</p>
    <div class="recipes-grid">
      <DishCard
        v-for="dish in dishes"
        :key="dish.id"
        :dish="dish"
      />
    </div>
  </section>
</template>

<style scoped>
.dish-catalog {
  padding: 3rem 1rem;
  min-height: 60vh;
}
.catalog-hint {
  background: #f7faf2;
  border-left: 3px solid #7CB342;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  color: #555;
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
}
.catalog-actions {
  text-align: right;
  margin-bottom: 1.5rem;
}
</style>
