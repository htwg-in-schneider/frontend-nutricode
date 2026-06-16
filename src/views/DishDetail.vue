<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../components/Button.vue'
import { CATEGORY_LABELS } from '../config.js'
import DishIngredients from '../components/DishIngredients.vue'
import { useApi } from '../composables/useApi.js'
import { useRoles } from '../composables/useRoles.js'


const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()
const { isLoading, isAuthenticated } = useRoles()
const dish = ref(null)
const error = ref(null)

async function loadDish(id) {
  try {
    // apiFetch sendet bei eingeloggten Nutzer:innen das Token -> eigenes Gericht;
    // anonym wird das globale Vorlagen-Gericht geladen.
    const response = await apiFetch(`/api/dish/${id}`)
    if (!response.ok) throw new Error('Gericht nicht gefunden')
    dish.value = await response.json()
    error.value = null
  } catch (err) {
    error.value = err.message
    dish.value = null
  }
}

// Erst laden, wenn Auth0 bereit ist; bei Login/Logout und id-Wechsel neu laden.
watch(
  [isLoading, isAuthenticated, () => route.params.id],
  ([loading, , id]) => {
    if (loading || !id) return
    loadDish(id)
  },
  { immediate: true }
)

function goBack() {
  router.back()
}
</script>

<template>
  <section class="dish-detail container" v-if="dish">
    <Button variant="outline" :onClick="goBack">← Zurück</Button>

    <div class="dish-detail-content">
      <img :src="dish.imageUrl" :alt="dish.title" class="dish-detail-image">
      <div class="dish-detail-info">
        <p class="dish-category">{{ CATEGORY_LABELS[dish.category] || dish.category }}</p>
        <h1>{{ dish.title }}</h1>
        <p class="dish-meta">{{ dish.calories }} kcal</p>
        <p class="dish-description">{{ dish.description }}</p>
        <p class="dish-description">{{ dish.description }}</p>

        <DishIngredients :dishId="dish.id" :key="dish.id" />

      </div>
    </div>
  </section>

  <section class="dish-detail container" v-else-if="error">
    <p>{{ error }}</p>
    <Button variant="outline" :onClick="goBack">← Zurück</Button>
  </section>

  <section class="dish-detail container" v-else>
    <p>Lade Gericht...</p>
  </section>
</template>

<style scoped>
.dish-detail {
  padding: 3rem 1rem;
}
.dish-detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 2rem;
}
.dish-detail-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
}
.dish-detail-info h1 {
  margin: 0.5rem 0;
}
.dish-category {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #888;
  letter-spacing: 0.05em;
  margin: 0;
}
.dish-meta {
  color: #555;
  margin: 0.5rem 0 1.5rem;
}
.dish-description {
  line-height: 1.6;
}

@media (max-width: 768px) {
  .dish-detail-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .dish-detail-image {
    height: 250px;
  }
}
</style>
