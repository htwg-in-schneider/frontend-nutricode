<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DishCard from '../components/DishCard.vue'
import DishFilter from '../components/DishFilter.vue'
import { API_BASE } from '../config.js'

const route = useRoute()
const dishes = ref([])
const error = ref(null)

async function fetchDishes(params = {}) {
  try {
    const query = new URLSearchParams()
    if (params.name) query.append('name', params.name)
    if (params.category) query.append('category', params.category)

    const url = query.toString()
      ? `${API_BASE}/api/dish?${query.toString()}`
      : `${API_BASE}/api/dish`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Fehler beim Laden der Gerichte')
    dishes.value = await response.json()
    error.value = null
  } catch (err) {
    error.value = err.message
  }
}

// Reagiert auf ?category=... aus der Navbar und lädt initial alle Gerichte
watch(
  () => route.query.category,
  (category) => fetchDishes({ category: category || '' }),
  { immediate: true }
)
</script>

<template>
  <section class="dish-catalog container">
    <div class="section-header">
      <p class="section-tag">Rezepte</p>
      <h2 class="section-title">Unsere Gerichte</h2>
    </div>

    <div style="text-align: right; margin-bottom: 1.5rem;">
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
</style>
