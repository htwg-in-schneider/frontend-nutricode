<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../components/Button.vue'

const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const error = ref(null)

async function loadRecipe(id) {
  try {
    const response = await fetch(`https://dummyjson.com/recipes/${id}`)
    if (!response.ok) throw new Error('Rezept nicht gefunden')
    recipe.value = await response.json()
    error.value = null
  } catch (err) {
    error.value = err.message
    recipe.value = null
  }
}

onMounted(() => loadRecipe(route.params.id))
watch(() => route.params.id, (newId) => newId && loadRecipe(newId))

function goBack() {
  router.back()
}
</script>

<template>
  <section class="recipe-detail container" v-if="recipe">
    <Button variant="outline" :onClick="goBack">← Zurück</Button>

    <div class="recipe-detail-content">
      <img :src="recipe.image" :alt="recipe.name" class="recipe-detail-image">
      <div class="recipe-detail-info">
        <p class="recipe-category">{{ recipe.mealType?.[0] || recipe.cuisine }}</p>
        <h1>{{ recipe.name }}</h1>
        <p class="recipe-meta">
          {{ recipe.caloriesPerServing }} kcal ·
          {{ (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) }} Min ·
          {{ recipe.servings }} Portionen
        </p>

        <h3>Zutaten</h3>
        <ul>
          <li v-for="ing in recipe.ingredients" :key="ing">{{ ing }}</li>
        </ul>

        <h3>Zubereitung</h3>
        <ol>
          <li v-for="step in recipe.instructions" :key="step">{{ step }}</li>
        </ol>
      </div>
    </div>
  </section>

  <section class="recipe-detail container" v-else-if="error">
    <p>{{ error }}</p>
    <Button variant="outline" :onClick="goBack">← Zurück</Button>
  </section>

  <section class="recipe-detail container" v-else>
    <p>Lade Rezept...</p>
  </section>
</template>

<style scoped>
.recipe-detail {
  padding: 3rem 1rem;
}
.recipe-detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 2rem;
}
.recipe-detail-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
}
.recipe-detail-info h1 {
  margin: 0.5rem 0;
}
.recipe-category {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #888;
  letter-spacing: 0.05em;
  margin: 0;
}
.recipe-meta {
  color: #555;
  margin: 0.5rem 0 1.5rem;
}
.recipe-detail-info ul,
.recipe-detail-info ol {
  padding-left: 1.5rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .recipe-detail-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .recipe-detail-image {
    height: 250px;
  }
}
</style>
