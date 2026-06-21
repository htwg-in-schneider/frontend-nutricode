<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../components/Button.vue'
import { useApi } from '../composables/useApi.js'
import { readApiError } from '../utils/apiError.js'
import { GOAL_LABELS, MEAL_SLOTS } from '../config.js'
import { LIMITS } from '../constants/validation.js'

/**
 * Ernährungsplan-Wizard = der komplexe, mehrstufige Vorgang.
 *
 * Vier Eingabemasken (Schritte). Nach JEDEM Schritt wird der Stand serverseitig
 * gespeichert (Entwurf), sodass Daten über mehrere Seiten hinweg erhalten bleiben
 * und der Vorgang später fortgesetzt werden kann. Beim Öffnen mit :id springt der
 * Wizard automatisch an die Stelle, an der der Nutzer zuletzt war (currentStep).
 */

const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()

const STEPS = [
  { nr: 1, title: 'Ziel & Rahmen' },
  { nr: 2, title: 'Kalorien' },
  { nr: 3, title: 'Gerichte' },
  { nr: 4, title: 'Überprüfen' },
]

const plan = ref(null)            // serverseitiger Plan (sobald angelegt)
const step = ref(1)               // aktuell sichtbare Eingabemaske (1..4)
const loading = ref(true)
const saving = ref(false)
const error = ref(null)

// Eingabefelder Schritt 1 + 2
const form = reactive({ name: '', goal: 'LOSE_WEIGHT', days: 3, targetCalories: 2000 })

// Auswahl Schritt 3: Map "tag-slot" -> dishId
const selections = reactive({})

// Eigene Gerichte des Nutzers (für die Dropdowns in Schritt 3)
const dishes = ref([])

const isCompleted = computed(() => plan.value?.status === 'COMPLETED')
const dayList = computed(() => Array.from({ length: form.days }, (_, i) => i))
const dishById = computed(() => {
  const map = {}
  for (const d of dishes.value) map[d.id] = d
  return map
})

function dishesForSlot(slotKey) {
  return dishes.value.filter((d) => d.category === slotKey)
}

function selKey(day, slot) {
  return `${day}-${slot}`
}

function dayCalories(day) {
  return MEAL_SLOTS.reduce((sum, s) => {
    const id = selections[selKey(day, s.key)]
    return sum + (id && dishById.value[id] ? dishById.value[id].calories : 0)
  }, 0)
}

// Übernimmt einen vom Server gelieferten Plan in Formular + Auswahl
function syncFromPlan(p) {
  plan.value = p
  form.name = p.name ?? ''
  form.goal = p.goal ?? 'LOSE_WEIGHT'
  form.days = p.days || 1
  form.targetCalories = p.targetCalories || 0
  for (const k of Object.keys(selections)) delete selections[k]
  for (const e of p.entries || []) {
    selections[selKey(e.dayIndex, e.slot)] = e.dishId
  }
}

async function loadDishes() {
  try {
    const res = await apiFetch('/api/dish')
    if (res.ok) dishes.value = await res.json()
  } catch (e) {
    // Gerichte sind optional ladbar – Dropdowns bleiben sonst leer
  }
}

onMounted(async () => {
  await loadDishes()
  const id = route.params.id
  if (id) {
    try {
      const res = await apiFetch(`/api/mealplan/${id}`)
      if (!res.ok) throw new Error('Plan konnte nicht geladen werden.')
      const p = await res.json()
      syncFromPlan(p)
      // An die zuletzt erreichte Stelle springen (abgeschlossen -> Zusammenfassung)
      step.value = p.status === 'COMPLETED' ? 4 : Math.min((p.currentStep || 1) + 1, 4)
    } catch (e) {
      error.value = e.message
    }
  }
  loading.value = false
})

// ---- Schritt-Aktionen (jede speichert serverseitig) ----

async function saveStep1() {
  error.value = null
  saving.value = true
  try {
    const body = JSON.stringify({ name: form.name, goal: form.goal, days: Number(form.days) })
    let res
    if (!plan.value) {
      // Erstmaliges Anlegen -> Entwurf, danach URL auf /ernaehrungsplan/:id setzen
      res = await apiFetch('/api/mealplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (!res.ok) throw new Error(await readApiError(res, 'Plan konnte nicht angelegt werden.'))
      const p = await res.json()
      syncFromPlan(p)
      router.replace(`/ernaehrungsplan/${p.id}`)
    } else {
      res = await apiFetch(`/api/mealplan/${plan.value.id}/step1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (!res.ok) throw new Error(await readApiError(res, 'Schritt 1 konnte nicht gespeichert werden.'))
      syncFromPlan(await res.json())
    }
    step.value = 2
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function saveStep2() {
  error.value = null
  saving.value = true
  try {
    const res = await apiFetch(`/api/mealplan/${plan.value.id}/step2`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetCalories: Number(form.targetCalories) }),
    })
    if (!res.ok) throw new Error(await readApiError(res, 'Schritt 2 konnte nicht gespeichert werden.'))
    syncFromPlan(await res.json())
    step.value = 3
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

function buildEntries() {
  const entries = []
  for (const day of dayList.value) {
    for (const s of MEAL_SLOTS) {
      const id = selections[selKey(day, s.key)]
      if (id) entries.push({ dayIndex: day, slot: s.key, dishId: id })
    }
  }
  return entries
}

async function saveStep3() {
  error.value = null
  saving.value = true
  try {
    const res = await apiFetch(`/api/mealplan/${plan.value.id}/step3`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildEntries()),
    })
    if (!res.ok) throw new Error(await readApiError(res, 'Schritt 3 konnte nicht gespeichert werden.'))
    syncFromPlan(await res.json())
    step.value = 4
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function autofill() {
  error.value = null
  saving.value = true
  try {
    const res = await apiFetch(`/api/mealplan/${plan.value.id}/autofill`, { method: 'POST' })
    if (!res.ok) throw new Error(await readApiError(res, 'Vorschlag konnte nicht erzeugt werden.'))
    syncFromPlan(await res.json())
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function complete() {
  error.value = null
  saving.value = true
  try {
    const res = await apiFetch(`/api/mealplan/${plan.value.id}/complete`, { method: 'POST' })
    if (!res.ok) throw new Error(await readApiError(res, 'Plan konnte nicht abgeschlossen werden.'))
    router.push('/ernaehrungsplan')
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

function goTo(nr) {
  // Nur zu bereits erreichten Schritten zurückspringen erlauben
  if (nr < step.value) step.value = nr
}
</script>

<template>
  <section class="wizard container">
    <div class="wizard-head">
      <h1>Ernährungsplan erstellen</h1>
      <router-link to="/ernaehrungsplan" class="wizard-exit">Abbrechen</router-link>
    </div>

    <!-- Fortschritts-Anzeige der vier Eingabemasken -->
    <ol class="stepper">
      <li
        v-for="s in STEPS"
        :key="s.nr"
        :class="{ active: s.nr === step, done: s.nr < step, clickable: s.nr < step }"
        @click="goTo(s.nr)"
      >
        <span class="stepper-nr">{{ s.nr }}</span>
        <span class="stepper-title">{{ s.title }}</span>
      </li>
    </ol>

    <p v-if="loading" class="wizard-info">Lade …</p>
    <p v-if="error" class="wizard-msg err">{{ error }}</p>

    <template v-if="!loading">
      <!-- ===== Schritt 1: Ziel & Rahmen ===== -->
      <form v-if="step === 1" class="wizard-form" @submit.prevent="saveStep1">
        <label>
          Name des Plans
          <input v-model="form.name" type="text" required placeholder="z. B. Mein Wochenplan" />
        </label>
        <label>
          Ziel
          <select v-model="form.goal">
            <option v-for="(label, key) in GOAL_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </label>
        <label>
          Anzahl Tage (1–7)
          <input v-model.number="form.days" type="number" :min="LIMITS.DAYS_MIN" :max="LIMITS.DAYS_MAX" required />
        </label>
        <div class="wizard-actions">
          <Button type="submit" variant="accent">{{ saving ? 'Speichert …' : 'Weiter' }}</Button>
        </div>
      </form>

      <!-- ===== Schritt 2: Zielkalorien ===== -->
      <form v-else-if="step === 2" class="wizard-form" @submit.prevent="saveStep2">
        <label>
          Zielkalorien pro Tag (kcal)
          <input v-model.number="form.targetCalories" type="number" :min="LIMITS.CALORIES_MIN" :max="LIMITS.CALORIES_MAX" step="50" required />
        </label>
        <p class="wizard-hint">
          Richtwert je Mahlzeit: ca. {{ Math.round(form.targetCalories / 3) }} kcal
          (bei drei Mahlzeiten pro Tag).
        </p>
        <div class="wizard-actions">
          <Button type="button" variant="outline" :onClick="() => (step = 1)">Zurück</Button>
          <Button type="submit" variant="accent">{{ saving ? 'Speichert …' : 'Weiter' }}</Button>
        </div>
      </form>

      <!-- ===== Schritt 3: Gerichte auswählen ===== -->
      <div v-else-if="step === 3" class="wizard-form">
        <div class="step3-head">
          <p class="wizard-hint">
            Wähle für jeden Tag deine Mahlzeiten. Ziel: {{ form.targetCalories }} kcal/Tag.
          </p>
          <Button type="button" variant="outline" :onClick="autofill">
            {{ saving ? 'Erzeuge …' : '✨ Vorschlag generieren' }}
          </Button>
        </div>

        <p v-if="dishes.length === 0" class="wizard-msg err">
          Du hast noch keine Gerichte. Lege zuerst unter „Gerichte“ welche an.
        </p>

        <div class="plan-grid-wrap">
          <table class="plan-grid">
            <thead>
              <tr>
                <th>Tag</th>
                <th v-for="s in MEAL_SLOTS" :key="s.key">{{ s.label }}</th>
                <th>Summe</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in dayList" :key="day">
                <td class="day-label">Tag {{ day + 1 }}</td>
                <td v-for="s in MEAL_SLOTS" :key="s.key">
                  <select v-model="selections[selKey(day, s.key)]">
                    <option :value="undefined">– keine –</option>
                    <option v-for="d in dishesForSlot(s.key)" :key="d.id" :value="d.id">
                      {{ d.title }} ({{ d.calories }} kcal)
                    </option>
                  </select>
                </td>
                <td
                  class="day-sum"
                  :class="{ over: form.targetCalories && dayCalories(day) > form.targetCalories }"
                >
                  {{ dayCalories(day) }} kcal
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="wizard-actions">
          <Button type="button" variant="outline" :onClick="() => (step = 2)">Zurück</Button>
          <Button type="button" variant="accent" :onClick="saveStep3">
            {{ saving ? 'Speichert …' : 'Weiter' }}
          </Button>
        </div>
      </div>

      <!-- ===== Schritt 4: Überprüfen & Abschließen ===== -->
      <div v-else-if="step === 4" class="wizard-form">
        <div v-if="isCompleted" class="completed-banner">✓ Dieser Plan ist abgeschlossen.</div>

        <h2 class="summary-title">{{ plan?.name }}</h2>
        <p class="summary-meta">
          Ziel: <strong>{{ GOAL_LABELS[plan?.goal] || '—' }}</strong> ·
          {{ plan?.days }} Tage · Ziel {{ plan?.targetCalories }} kcal/Tag
        </p>

        <div v-for="day in dayList" :key="day" class="summary-day">
          <h3>Tag {{ day + 1 }} <span class="summary-day-sum">{{ dayCalories(day) }} kcal</span></h3>
          <ul>
            <li v-for="s in MEAL_SLOTS" :key="s.key">
              <span class="slot-label">{{ s.label }}:</span>
              <span v-if="selections[selKey(day, s.key)] && dishById[selections[selKey(day, s.key)]]">
                {{ dishById[selections[selKey(day, s.key)]].title }}
                ({{ dishById[selections[selKey(day, s.key)]].calories }} kcal)
              </span>
              <span v-else class="muted">– keine –</span>
            </li>
          </ul>
        </div>

        <div class="wizard-actions">
          <Button v-if="!isCompleted" type="button" variant="outline" :onClick="() => (step = 3)">Zurück</Button>
          <Button v-if="!isCompleted" type="button" variant="accent" :onClick="complete">
            {{ saving ? 'Schließt ab …' : 'Plan abschließen' }}
          </Button>
          <Button v-else type="button" variant="accent" :onClick="() => router.push('/ernaehrungsplan')">
            Zur Übersicht
          </Button>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.wizard {
  max-width: 820px;
  padding: 3rem 1rem;
}
.wizard-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.wizard-exit {
  font-size: 0.9rem;
  color: #6B6B6B;
}
.wizard-exit:hover {
  color: var(--color-danger);
}

/* Stepper */
.stepper {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  margin: 1.5rem 0 2rem;
  flex-wrap: wrap;
}
.stepper li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 140px;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  background: #f3f5ef;
  color: #888;
  font-size: 0.85rem;
  font-weight: 600;
}
.stepper li.active {
  background: rgba(124, 179, 66, 0.15);
  color: var(--color-primary-dark);
}
.stepper li.done {
  color: var(--color-primary-dark);
}
.stepper li.clickable {
  cursor: pointer;
}
.stepper-nr {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 999px;
  background: #fff;
  border: 2px solid currentColor;
  font-size: 0.8rem;
}
.stepper li.active .stepper-nr,
.stepper li.done .stepper-nr {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

/* Formular */
.wizard-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.wizard-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 600;
  color: #444;
}
.wizard-form input,
.wizard-form select {
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}
.wizard-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}
.wizard-hint {
  color: #666;
  font-size: 0.9rem;
}
.wizard-info {
  color: #555;
}
.wizard-msg.err {
  color: var(--color-danger);
  font-weight: 600;
}

/* Schritt 3: Raster */
.step3-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.plan-grid-wrap {
  overflow-x: auto;
}
.plan-grid {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}
.plan-grid th,
.plan-grid td {
  padding: 0.6rem 0.7rem;
  border-bottom: 1px solid #eee;
  text-align: left;
  vertical-align: middle;
}
.plan-grid th {
  color: var(--color-primary-dark);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.plan-grid select {
  width: 100%;
  padding: 0.45rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: inherit;
}
.day-label {
  font-weight: 700;
  white-space: nowrap;
}
.day-sum {
  font-weight: 700;
  white-space: nowrap;
}
.day-sum.over {
  color: var(--color-danger);
}

/* Schritt 4: Zusammenfassung */
.completed-banner {
  background: rgba(124, 179, 66, 0.15);
  color: var(--color-primary-dark);
  font-weight: 700;
  padding: 0.7rem 1rem;
  border-radius: 8px;
}
.summary-title {
  margin-bottom: 0.2rem;
}
.summary-meta {
  color: #555;
  margin-bottom: 1rem;
}
.summary-day {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 0.8rem 1rem;
}
.summary-day h3 {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}
.summary-day-sum {
  font-size: 0.85rem;
  color: var(--color-primary-dark);
  font-weight: 700;
}
.summary-day ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.slot-label {
  display: inline-block;
  width: 110px;
  font-weight: 600;
  color: #444;
}
.muted {
  color: #999;
}

/* Mobile: Stepper kompakt (nur Nummern), Aktionen volle Breite */
@media (max-width: 540px) {
  .stepper li {
    min-width: 0;
    flex: 1;
    justify-content: center;
    padding: 0.5rem;
  }
  .stepper-title {
    display: none;
  }
  .wizard-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .slot-label {
    width: auto;
    display: block;
  }
}
</style>
