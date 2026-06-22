<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../components/Button.vue'
import { API_BASE } from '../config.js'
import { useApi } from '../composables/useApi.js'
import { useDialog } from '../composables/useDialog.js'
import { readApiError } from '../utils/apiError.js'
import { LIMITS } from '../constants/validation.js'
import { clampNumber } from '../utils/clamp.js'

const router = useRouter()
const { apiFetch } = useApi()
const { notify } = useDialog()

const dish = ref({
  title: '',
  description: '',
  calories: 0,
  imageUrl: '',
  category: 'BREAKFAST'
})

// Kalorien beim Verlassen des Feldes auf den gültigen Bereich begrenzen.
function clampCalories() {
  dish.value.calories = clampNumber(dish.value.calories, LIMITS.DISH_CALORIES_MIN, LIMITS.CALORIES_MAX)
}

const categories = ref([])
const ingredients = ref([])   // lokale Liste: [{ name, amount }]

onMounted(async () => {
  try {
    const response = await fetch(`${API_BASE}/api/category`)
    categories.value = await response.json()
  } catch (err) {
    notify('Kategorien konnten nicht geladen werden', 'error')
  }
})

function addIngredientRow() {
  ingredients.value.push({ name: '', amount: '' })
}

function removeIngredientRow(index) {
  ingredients.value.splice(index, 1)
}

async function createDish() {
  try {
    // 1) Gericht anlegen
    const response = await apiFetch('/api/dish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dish.value)
    })
    if (!response.ok) throw new Error(await readApiError(response, 'Fehler beim Anlegen des Gerichts'))
    const created = await response.json()

    // 2) Zutaten anlegen (1:n) – jede mit dem neuen Gericht verknüpfen
    for (const ing of ingredients.value) {
      if (!ing.name) continue
      const ingRes = await apiFetch('/api/ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ing.name,
          amount: ing.amount,
          dish: { id: created.id }
        })
      })
      if (!ingRes.ok) throw new Error(await readApiError(ingRes, 'Zutat konnte nicht gespeichert werden'))
    }

    notify('Gericht erfolgreich angelegt ✓', 'success')
    router.push('/gerichte')
  } catch (err) {
    notify(err.message, 'error')
  }
}
</script>

<template>
  <section class="dish-form container">
    <h1>Neues Gericht</h1>
    <form @submit.prevent="createDish">
      <label>
        Titel
        <input v-model="dish.title" type="text" required :maxlength="LIMITS.DISH_TITLE_MAX">
      </label>
      <label>
        Beschreibung
        <textarea v-model="dish.description" rows="3" :maxlength="LIMITS.DISH_DESC_MAX"></textarea>
      </label>
      <label>
        Kalorien
        <input
          v-model.number="dish.calories" type="number" required
          :min="LIMITS.DISH_CALORIES_MIN" :max="LIMITS.CALORIES_MAX"
          @change="clampCalories"
        >
      </label>
      <label>
        Bild-URL
        <input v-model="dish.imageUrl" type="url" :maxlength="LIMITS.IMAGE_URL_MAX" placeholder="https://...">
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
        <div v-for="(ing, index) in ingredients" :key="index" class="ingredient-row">
          <input v-model="ing.name" type="text" :maxlength="LIMITS.INGREDIENT_NAME_MAX" placeholder="Zutat (z. B. Haferflocken)">
          <input v-model="ing.amount" type="text" :maxlength="LIMITS.INGREDIENT_AMOUNT_MAX" placeholder="Menge (z. B. 50 g)">
          <button type="button" class="btn btn-danger" @click="removeIngredientRow(index)">✕</button>
        </div>
        <button type="button" class="btn btn-outline" @click="addIngredientRow">+ Zutat hinzufügen</button>
      </fieldset>

      <div class="form-actions">
        <Button type="submit" variant="accent">Anlegen</Button>
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
.ingredient-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
.ingredient-row input {
  flex: 1;
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
