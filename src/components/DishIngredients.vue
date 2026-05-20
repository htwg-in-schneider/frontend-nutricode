<script setup>
import { ref, onMounted } from 'vue'
import { API_BASE } from '../config.js'

const props = defineProps({
  dishId: { type: [Number, String], required: true }
})

const ingredients = ref([])
const error = ref(null)

onMounted(async () => {
  try {
    const response = await fetch(`${API_BASE}/api/ingredient/dish/${props.dishId}`)
    if (!response.ok) throw new Error('Zutaten konnten nicht geladen werden')
    ingredients.value = await response.json()
  } catch (err) {
    error.value = err.message
  }
})
</script>

<template>
  <div class="dish-ingredients">
    <h3>Zutaten</h3>
    <p v-if="error">{{ error }}</p>
    <p v-else-if="ingredients.length === 0">Keine Zutaten hinterlegt.</p>
    <ul v-else>
      <li v-for="ing in ingredients" :key="ing.id">
        <span class="ing-name">{{ ing.name }}</span>
        <span class="ing-amount">{{ ing.amount }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dish-ingredients {
  margin-top: 2rem;
}
.dish-ingredients ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.dish-ingredients li {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid #eee;
}
.ing-name {
  font-weight: 600;
}
.ing-amount {
  color: #777;
}
</style>
