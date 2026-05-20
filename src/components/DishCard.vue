<script setup>
import { CATEGORY_LABELS } from '../config.js'

const props = defineProps({
  dish: { type: Object, required: true }
})
</script>

<template>
  <article class="dish-card">
    <img :src="dish.imageUrl" :alt="dish.title" class="dish-image">
    <p class="dish-category">{{ CATEGORY_LABELS[dish.category] || dish.category }}</p>
    <h3 class="dish-name">{{ dish.title }}</h3>
    <p class="dish-meta">{{ dish.calories }} kcal</p>
    <router-link :to="`/dish/${dish.id}`" class="btn btn-outline">
      Details
    </router-link>
  </article>
</template>

<style scoped>
.dish-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dish-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.dish-category {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #888;
  margin: 0;
  letter-spacing: 0.05em;
}

.dish-name {
  font-size: 1.2rem;
  margin: 0;
}

.dish-meta {
  color: #555;
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
}
</style>
