<script setup>
const props = defineProps({
  recipe: { type: Object, required: true }
})
</script>

<template>
  <article class="recipe-card">
    <img :src="recipe.image" :alt="recipe.name" class="recipe-image">
    <p class="recipe-category">{{ recipe.category }}</p>
    <h3 class="recipe-name">{{ recipe.name }}</h3>
    <p class="recipe-meta">{{ recipe.kcal }} kcal · {{ recipe.duration }} Min</p>
    <router-link
      :to="`/recipe/${recipe.id}`"
      class="btn btn-outline"
    >
      Details
    </router-link>
  </article>
</template>

<style scoped>
.recipe-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recipe-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.recipe-category {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #888;
  margin: 0;
  letter-spacing: 0.05em;
}

.recipe-name {
  font-size: 1.2rem;
  margin: 0;
}

.recipe-meta {
  color: #555;
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
}
</style>
