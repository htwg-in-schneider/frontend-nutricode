<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../components/Button.vue'
import { API_BASE } from '../config.js'

const route = useRoute()
const router = useRouter()

const dish = ref({
  title: '',
  description: '',
  calories: 0,
  imageUrl: '',
  category: 'BREAKFAST'
})
const categories = ref([])

onMounted(async () => {
  try {
    const [dishRes, catRes] = await Promise.all([
      fetch(`${API_BASE}/api/dish/${route.params.id}`),
      fetch(`${API_BASE}/api/category`)
    ])
    if (!dishRes.ok) throw new Error('Gericht nicht gefunden')
    dish.value = await dishRes.json()
    categories.value = await catRes.json()
  } catch (err) {
    alert(err.message)
    router.push('/gerichte')
  }
})

async function updateDish() {
  try {
    const response = await fetch(`${API_BASE}/api/dish/${route.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dish.value)
    })
    if (!response.ok) throw new Error('Fehler beim Speichern')
    alert('Gericht gespeichert!')
    router.push(`/dish/${route.params.id}`)
  } catch (err) {
    alert(err.message)
  }
}

async function deleteDish() {
  if (!confirm('Dieses Gericht wirklich löschen?')) return
  try {
    const response = await fetch(`${API_BASE}/api/dish/${route.params.id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Fehler beim Löschen')
    alert('Gericht gelöscht!')
    router.push('/gerichte')
  } catch (err) {
    alert(err.message)
  }
}
</script>

<template>
  <section class="dish-form container">
    <h1>Gericht bearbeiten</h1>
    <form @submit.prevent="updateDish">
      <label>
        Titel
        <input v-model="dish.title" type="text" required>
      </label>
      <label>
        Beschreibung
        <textarea v-model="dish.description" rows="3"></textarea>
      </label>
      <label>
        Kalorien
        <input v-model.number="dish.calories" type="number" min="0" required>
      </label>
      <label>
        Bild-URL
        <input v-model="dish.imageUrl" type="text" placeholder="https://...">
      </label>
      <label>
        Kategorie
        <select v-model="dish.category">
          <option v-for="cat in categories" :key="cat.name" :value="cat.name">
            {{ cat.label }}
          </option>
        </select>
      </label>
      <div class="form-actions">
        <Button type="submit" variant="accent">Speichern</Button>
        <Button type="button" variant="danger" :onClick="deleteDish">Löschen</Button>
        <Button type="button" variant="outline" :onClick="() => router.push('/gerichte')">Abbrechen</Button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.dish-form {
  max-width: 600px;
  padding: 3rem 1rem;
}
.dish-form h1 {
  margin-bottom: 1.5rem;
}
.dish-form form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.dish-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 600;
  color: #444;
}
.dish-form input,
.dish-form textarea,
.dish-form select {
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}
</style>
