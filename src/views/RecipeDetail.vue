<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { recipes } from '../data.js'
import Button from '../components/Button.vue'

const route = useRoute()
const router = useRouter()

const recipe = computed(() =>
  recipes.find(r => r.id === Number(route.params.id))
)

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
        <p class="recipe-category">{{ recipe.category }}</p>
        <h1>{{ recipe.name }}</h1>
        <p class="recipe-meta">{{ recipe.kcal }} kcal · {{ recipe.duration }} Min</p>
        <p class="recipe-description">{{ recipe.description }}</p>
      </div>
    </div>
  </section>

  <section class="recipe-detail container" v-else>
    <p>Rezept nicht gefunden.</p>
    <Button variant="outline" :onClick="goBack">← Zurück</Button>
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
.recipe-description {
  line-height: 1.6;
  color: #333;
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
