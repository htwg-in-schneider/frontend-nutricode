<script setup>
import { ref, onMounted } from 'vue'
import Button from './Button.vue'
import { API_BASE } from '../config.js'

const emit = defineEmits(['search'])

const name = ref('')
const category = ref('')
const categories = ref([])

onMounted(async () => {
  try {
    const response = await fetch(`${API_BASE}/api/category`)
    categories.value = await response.json()
  } catch (err) {
    console.error('Kategorien konnten nicht geladen werden', err)
  }
})

function search() {
  emit('search', { name: name.value, category: category.value })
}

function reset() {
  name.value = ''
  category.value = ''
  emit('search', { name: '', category: '' })
}
</script>

<template>
  <form class="dish-filter" @submit.prevent="search">
    <input
      v-model="name"
      type="text"
      placeholder="Gericht suchen..."
      class="dish-filter-input"
    >
    <select v-model="category" class="dish-filter-select">
      <option value="">Alle Kategorien</option>
      <option v-for="cat in categories" :key="cat.name" :value="cat.name">
        {{ cat.label }}
      </option>
    </select>
    <Button type="submit" variant="accent">Suchen</Button>
    <Button type="button" variant="outline" :onClick="reset">Zurücksetzen</Button>
  </form>
</template>

<style scoped>
.dish-filter {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 2rem;
}
.dish-filter-input,
.dish-filter-select {
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}
.dish-filter-input {
  flex: 1;
  min-width: 200px;
}
@media (max-width: 768px) {
  .dish-filter {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
