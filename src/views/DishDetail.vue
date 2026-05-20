<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../components/Button.vue'
import { API_BASE, CATEGORY_LABELS } from '../config.js'

const route = useRoute()
const router = useRouter()
const dish = ref(null)
const error = ref(null)

async function loadDish(id) {
  try {
    const response = await fetch(`${API_BASE}/api/dish/${id}`)
    if (!response.ok) throw new Error('Gericht nicht gefunden')
    dish.value = await response.json()
    error.value = null
  } catch (err) {
    error.value = err.message
    dish.value = null
  }
}

onMounted(() => loadDish(route.params.id))
watch(() => route.params.id, (newId) => newId && loadDish(newId))

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
