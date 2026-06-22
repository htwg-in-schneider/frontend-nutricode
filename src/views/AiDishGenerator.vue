<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../components/Button.vue'
import DishCard from '../components/DishCard.vue'
import { useApi } from '../composables/useApi.js'
import { readApiError } from '../utils/apiError.js'
import { DISH_PREFERENCES } from '../constants/nutrition.js'
import { LIMITS } from '../constants/validation.js'
import { calcTdee } from '../utils/mifflin.js'

/**
 * KI-Gerichtegenerator: Der Nutzer gibt Tageskalorien, Tage und Vorlieben an;
 * Gemini erzeugt passende Gerichte (im NutriCode-Format), die als eigene
 * Gerichte gespeichert werden und danach im Katalog / Plan-Wizard nutzbar sind.
 */

const router = useRouter()
const { apiFetch } = useApi()

const form = reactive({ targetCalories: 2000, days: 3, exclude: '', notes: '' })
// Vorlieben: pro Frage Standard "Egal"
const prefs = reactive({})
DISH_PREFERENCES.forEach((p) => { prefs[p.key] = 'Egal' })

const loading = ref(false)
const error = ref(null)
const generated = ref([])

// Tageskalorien aus dem Profil vorbefüllen (Tagesbedarf), falls Körperdaten da sind
onMounted(async () => {
  try {
    const res = await apiFetch('/api/profile')
    if (!res.ok) return
    const p = await res.json()
    const tdee = calcTdee({ sex: p.sex, age: p.age, heightCm: p.heightCm, weightKg: p.weightKg, activityLevel: p.activityLevel })
    if (tdee) form.targetCalories = tdee
  } catch (e) {
    // Profil optional – Default bleibt
  }
})

async function generate() {
  error.value = null
  generated.value = []
  loading.value = true
  try {
    // Nur gesetzte Vorlieben senden ("Egal" weglassen)
    const preferences = []
    for (const p of DISH_PREFERENCES) {
      if (prefs[p.key] && prefs[p.key] !== 'Egal') preferences.push({ label: p.label, value: prefs[p.key] })
    }
    if (form.exclude.trim()) preferences.push({ label: 'Ausschließen (Abneigungen/Allergien)', value: form.exclude.trim() })
    if (form.notes.trim()) preferences.push({ label: 'Sonstige Wünsche', value: form.notes.trim() })

    const res = await apiFetch('/api/ai/dishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        days: Number(form.days),
        targetCalories: Number(form.targetCalories),
        preferences,
      }),
    })
    if (!res.ok) throw new Error(await readApiError(res, 'Generierung fehlgeschlagen.'))
    generated.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="ai container">
    <h1>KI-Gerichte generieren</h1>
    <p class="ai-sub">
      Lass dir passende Gerichte erstellen – basierend auf deinem Kalorienbedarf,
      der Anzahl Tage und deinen Vorlieben. Die Gerichte landen automatisch in
      „Meine Gerichte“ und stehen dann im Ernährungsplan zur Verfügung.
    </p>

    <form class="ai-form" @submit.prevent="generate">
      <div class="ai-row">
        <label>
          Zielkalorien pro Tag (kcal)
          <input v-model.number="form.targetCalories" type="number" :min="LIMITS.CALORIES_MIN" :max="LIMITS.CALORIES_MAX" step="50" required />
        </label>
        <label>
          Anzahl Tage
          <input v-model.number="form.days" type="number" :min="LIMITS.DAYS_MIN" :max="LIMITS.DAYS_MAX" required />
        </label>
      </div>

      <fieldset class="ai-prefs">
        <legend>Deine Vorlieben <span class="hint">(„Egal“ lassen, was dir nicht wichtig ist)</span></legend>
        <div class="ai-pref-grid">
          <label v-for="p in DISH_PREFERENCES" :key="p.key">
            {{ p.label }}
            <select v-model="prefs[p.key]">
              <option v-for="opt in p.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </label>
        </div>
        <label>
          Ausschließen (Abneigungen / Allergien)
          <input v-model="form.exclude" type="text" placeholder="z. B. keine Erdbeeren, keine Nüsse" />
        </label>
        <label>
          Sonstige Wünsche (optional)
          <input v-model="form.notes" type="text" placeholder="z. B. schnelle Rezepte, viel Eiweiß" />
        </label>
      </fieldset>

      <div class="ai-actions">
        <Button type="submit" variant="accent">
          {{ loading ? 'Generiere … (kann bis zu 30 Sek. dauern)' : '✨ Gerichte generieren' }}
        </Button>
      </div>

      <p v-if="error" class="ai-msg err">{{ error }}</p>
    </form>

    <!-- Ergebnis -->
    <div v-if="generated.length" class="ai-result">
      <p class="ai-msg ok">
        {{ generated.length }} Gerichte erstellt und zu „Meine Gerichte“ hinzugefügt ✓
      </p>
      <div class="ai-actions">
        <Button type="button" variant="accent" :onClick="() => router.push('/ernaehrungsplan/neu')">
          Ernährungsplan erstellen →
        </Button>
        <Button type="button" variant="outline" :onClick="() => router.push('/gerichte')">
          Zu meinen Gerichten
        </Button>
      </div>
      <div class="recipes-grid">
        <DishCard v-for="d in generated" :key="d.id" :dish="d" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.ai {
  max-width: 820px;
  padding: 3rem 1rem;
}
.ai-sub {
  color: #555;
  margin: 0.5rem 0 2rem;
  max-width: 620px;
}
.ai-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.ai-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.ai-row label {
  flex: 1;
  min-width: 160px;
}
.ai-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 600;
  color: #444;
}
.ai-form input,
.ai-form select {
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}
.ai-prefs {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 1rem 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.ai-prefs legend {
  font-weight: 700;
  padding: 0 0.5rem;
}
.ai-prefs .hint {
  font-weight: 400;
  color: #999;
  font-size: 0.85rem;
}
.ai-pref-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.ai-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.ai-msg {
  font-weight: 600;
  margin: 0;
}
.ai-msg.err {
  color: var(--color-danger);
}
.ai-msg.ok {
  color: var(--color-primary-dark);
}
.ai-result {
  margin-top: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
</style>
