<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../components/Button.vue'
import { API_BASE } from '../config.js'
import { useApi } from '../composables/useApi.js'

const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()

const dish = ref({
  title: '',
  description: '',
  calories: 0,
  imageUrl: '',
  category: 'BREAKFAST'
})
const categories = ref([])
const ingredients = ref([])                 // bestehende Zutaten (mit id)
const newIngredient = ref({ name: '', amount: '' })

async function loadIngredients() {
  const res = await fetch(`${API_BASE}/api/ingredient/dish/${route.params.id}`)
  ingredients.value = await res.json()
}

onMounted(async () => {
  try {
    // Gericht mit Token laden -> eigenes Gericht (User) bzw. Vorlage (Admin).
    // Kategorien sind öffentlich und brauchen kein Token.
    const [dishRes, catRes] = await Promise.all([
      apiFetch(`/api/dish/${route.params.id}`),
      fetch(`${API_BASE}/api/category`)
    ])
    if (!dishRes.ok) throw new Error('Gericht nicht gefunden')
    dish.value = await dishRes.json()
    categories.value = await catRes.json()
    await loadIngredients()
  } catch (err) {
    alert(err.message)
    router.push('/gerichte')
  }
})

async function updateDish() {
  try {
    const response = await apiFetch(`/api/dish/${route.params.id}`, {
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

async function addIngredient() {
  if (!newIngredient.value.name) return
  try {
    const res = await apiFetch('/api/ingredient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newIngredient.value.name,
        amount: newIngredient.value.amount,
        dish: { id: route.params.id }
      })
    })
    if (!res.ok) throw new Error('Zutat konnte nicht hinzugefügt werden')
    newIngredient.value = { name: '', amount: '' }
    await loadIngredients()
  } catch (err) {
    alert(err.message)
  }
}

async function removeIngredient(id) {
  try {
    const res = await apiFetch(`/api/ingredient/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Zutat konnte nicht gelöscht werden')
    await loadIngredients()
  } catch (err) {
    alert(err.message)
  }
}

async function deleteDish() {
  if (!confirm('Dieses Gericht wirklich löschen?')) return
  try {
    const response = await apiFetch(`/api/dish/${route.params.id}`, {
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

      <fieldset class="ingredients-fieldset">
        <legend>Zutaten</legend>
        <ul class="ingredient-list">
          <li v-for="ing in ingredients" :key="ing.id" class="ingredient-item">
            <span>{{ ing.name }} – {{ ing.amount }}</span>
            <button type="button" class="btn btn-danger" @click="removeIngredient(ing.id)">✕</button>
          </li>
          <li v-if="ingredients.length === 0" class="ingredient-empty">Noch keine Zutaten.</li>
        </ul>
        <div class="ingredient-row">
          <input v-model="newIngredient.name" type="text" placeholder="Zutat">
          <input v-model="newIngredient.amount" type="text" placeholder="Menge">
          <button type="button" class="btn btn-outline" @click="addIngredient">+ Hinzufügen</button>
        </div>
      </fieldset>

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
.ingredients-fieldset {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}
.ingredients-fieldset legend {
  font-weight: 700;
  padding: 0 0.5rem;
}
.ingredient-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem 0;
}
.ingredient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid #eee;
}
.ingredient-empty {
  color: #888;
  padding: 0.4rem 0;
}
.ingredient-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.btn-danger {
  padding: 0.45rem 0.7rem;
  font-size: 0.85rem;
}
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}
</style>
