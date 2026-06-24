<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../components/Button.vue'
import { useApi } from '../composables/useApi.js'
import { useDialog } from '../composables/useDialog.js'
import { readApiError } from '../utils/apiError.js'
import { GOAL_LABELS, MEAL_SLOTS } from '../config.js'
import { LIMITS } from '../constants/validation.js'
import { clampNumber } from '../utils/clamp.js'
import { SEX_OPTIONS, ACTIVITY_LEVELS, DISH_PREFERENCES } from '../constants/nutrition.js'
import { calcBmr, calcTdee, calcTargetCalories } from '../utils/mifflin.js'
import { popPendingMetrics } from '../utils/pendingMetrics.js'

/**
 * Ernährungsplan-Wizard = der komplexe, mehrstufige Vorgang.
 *
 * Fünf Eingabemasken (Schritte). Nach JEDEM Schritt wird der Stand serverseitig
 * gespeichert (Entwurf), sodass Daten über mehrere Seiten hinweg erhalten bleiben
 * und der Vorgang später fortgesetzt werden kann. Beim Öffnen mit :id springt der
 * Wizard automatisch an die Stelle, an der der Nutzer zuletzt war (currentStep).
 */

const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()
const { notify } = useDialog()

const STEPS = [
  { nr: 1, title: 'Ziel & Rahmen' },
  { nr: 2, title: 'Bedarf' },
  { nr: 3, title: 'Vorlieben' },
  { nr: 4, title: 'Gerichte' },
  { nr: 5, title: 'Überprüfen' },
]

const plan = ref(null)            // serverseitiger Plan (sobald angelegt)
const step = ref(1)               // aktuell sichtbare Eingabemaske (1..4)
const loading = ref(true)
const saving = ref(false)
const error = ref(null)

// Eingabefelder Schritt 1 + 2 (inkl. Körperdaten für die Mifflin-Berechnung)
const form = reactive({
  name: '', goal: 'LOSE_WEIGHT', days: 3, targetCalories: 2000,
  sex: 'MALE', age: null, heightCm: null, weightKg: null, activityLevel: 'MODERATE',
})

// Eingaben beim Verlassen des Feldes auf plausible Werte begrenzen.
function clampField(key, min, max, integer = true) {
  form[key] = clampNumber(form[key], min, max, { integer })
}

// Wie clampField, sichert die Körperdaten zusätzlich sofort ins Profil – damit
// sie auch ohne Abschluss von Schritt 2 erhalten bleiben (überall immer gespeichert).
function clampMetric(key, min, max, integer = true) {
  clampField(key, min, max, integer)
  saveProfileMetrics()
}

// true, sobald die Zielkalorien manuell/aus dem Plan gesetzt sind -> dann nicht
// mehr automatisch mit dem berechneten Vorschlag überschreiben.
const targetTouched = ref(false)

// Mifflin-St-Jeor: Grundumsatz, Tagesbedarf und empfohlene Zielkalorien (live)
const bmr = computed(() => calcBmr(form))
const tdee = computed(() => calcTdee(form))
const recommendedCalories = computed(() => calcTargetCalories(form, form.goal))

watch(recommendedCalories, (val) => {
  if (val != null && !targetTouched.value) form.targetCalories = val
})

// Auswahl Schritt 3: Map "tag-slot" -> dishId
const selections = reactive({})

// Eigene Gerichte des Nutzers (für die Dropdowns in Schritt 4)
const dishes = ref([])

// Schritt 3: Vorlieben für die KI-Generierung (Standard "Egal" je Frage)
const prefs = reactive({})
DISH_PREFERENCES.forEach((p) => { prefs[p.key] = 'Egal' })
const exclude = ref('')
const notes = ref('')

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
  // Gespeicherten Wert nicht durch den Vorschlag überschreiben (sonst frei berechnen)
  targetTouched.value = (p.targetCalories || 0) > 0
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

// Körperdaten aus dem Profil vorbefüllen (beim wiederholten Plan muss man so
// nichts erneut eintippen). Bleibt leer, falls noch nichts hinterlegt ist.
async function loadProfile() {
  try {
    const res = await apiFetch('/api/profile')
    if (!res.ok) return
    const p = await res.json()
    if (p.sex) form.sex = p.sex
    if (p.age != null) form.age = p.age
    if (p.heightCm != null) form.heightCm = p.heightCm
    if (p.weightKg != null) form.weightKg = p.weightKg
    if (p.activityLevel) form.activityLevel = p.activityLevel
  } catch (e) {
    // Profil optional – Felder bleiben leer
  }
}

// Empfohlene Kalorien manuell übernehmen (verlinkt das Zielfeld wieder ans Profil)
function applyRecommended() {
  if (recommendedCalories.value != null) {
    form.targetCalories = recommendedCalories.value
    targetTouched.value = false
  }
}

// Körperdaten fürs nächste Mal im Profil speichern (partielles Update; nur Werte)
async function saveProfileMetrics() {
  try {
    await apiFetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sex: form.sex,
        age: form.age !== null && form.age !== '' ? Number(form.age) : null,
        heightCm: form.heightCm !== null && form.heightCm !== '' ? Number(form.heightCm) : null,
        weightKg: form.weightKg !== null && form.weightKg !== '' ? Number(form.weightKg) : null,
        activityLevel: form.activityLevel,
      }),
    })
  } catch (e) {
    // Profil-Speichern ist optional und darf den Plan-Fortschritt nicht blockieren
  }
}

// Hat der Nutzer die Werte im öffentlichen Kalorienrechner (ohne Login) eingegeben
// und sich dann für den Plan angemeldet, liegen sie zwischengespeichert vor: einmalig
// ins Profil übernehmen, danach füllt loadProfile() sie regulär in den Wizard.
async function applyPendingMetrics() {
  const metrics = popPendingMetrics()
  if (!metrics) return
  try {
    await apiFetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
    })
  } catch (e) {
    // Übernahme optional – die Werte lassen sich im Wizard erneut eingeben
  }
}

onMounted(async () => {
  await loadDishes()
  // Vor dem Vorausfüllen: evtl. anonym im Kalorienrechner eingegebene Werte
  // (nach dem Login) ins Profil übernehmen, damit loadProfile() sie findet.
  await applyPendingMetrics()
  await loadProfile()
  const id = route.params.id
  if (id) {
    try {
      const res = await apiFetch(`/api/mealplan/${id}`)
      if (!res.ok) throw new Error('Plan konnte nicht geladen werden.')
      const p = await res.json()
      syncFromPlan(p)
      // An die zuletzt erreichte Stelle springen (abgeschlossen -> Zusammenfassung).
      // Frontend-Schritt = currentStep + 1 (Vorlieben sind ein reiner Frontend-Schritt).
      step.value = p.status === 'COMPLETED' ? 5 : Math.min((p.currentStep || 1) + 1, 5)
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
    // Körperdaten im Profil ablegen, damit sie beim nächsten Plan vorausgefüllt sind
    await saveProfileMetrics()
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
    if (!res.ok) throw new Error(await readApiError(res, 'Gerichte konnten nicht gespeichert werden.'))
    syncFromPlan(await res.json())
    step.value = 5
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

// Vorlieben in das Backend-Format bringen ("Egal"/leere weglassen)
function buildPreferences() {
  const list = []
  for (const p of DISH_PREFERENCES) {
    if (prefs[p.key] && prefs[p.key] !== 'Egal') list.push({ label: p.label, value: prefs[p.key] })
  }
  if (exclude.value.trim()) list.push({ label: 'Ausschließen (Abneigungen/Allergien)', value: exclude.value.trim() })
  if (notes.value.trim()) list.push({ label: 'Sonstige Wünsche', value: notes.value.trim() })
  return list
}

// Schritt 4: Gerichte erzeugen. Bevorzugt per KI (ai-fill) anhand Tage,
// Zielkalorien und Vorlieben. Ist die KI nicht verfügbar (kein API-Key, Rate-
// Limit, Ausfall), wird automatisch auf den KI-freien Heuristik-Vorschlag
// (autofill aus den eigenen Gerichten) zurückgegriffen – so lässt sich der
// Vorgang auch ohne KI vollständig abschließen. Gibt true bei Erfolg zurück.
async function aiGenerate() {
  error.value = null
  saving.value = true
  try {
    const res = await apiFetch(`/api/mealplan/${plan.value.id}/ai-fill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: buildPreferences() }),
    })
    if (res.ok) {
      await loadDishes()
      syncFromPlan(await res.json())
      return true
    }
    // KI fehlgeschlagen -> KI-freien Fallback versuchen
    return await fillFromOwnDishes(await readApiError(res, 'KI-Gerichte konnten nicht erzeugt werden.'))
  } catch (e) {
    // Netzwerk-/sonstiger Fehler bei der KI -> ebenfalls Fallback versuchen
    return await fillFromOwnDishes(e.message)
  } finally {
    saving.value = false
  }
}

// KI-freier Fallback: füllt den Plan serverseitig aus den eigenen Gerichten des
// Nutzers (passend zum Kalorienziel). Bei Erfolg true + Hinweis-Toast; schlägt
// auch das fehl, wird der ursprüngliche KI-Fehler angezeigt.
async function fillFromOwnDishes(aiErrorMessage) {
  // Echten Grund sichtbar machen (z. B. "KI ist nicht konfiguriert
  // (GEMINI_API_KEY fehlt)" oder "KI ist gerade ausgelastet"), damit der
  // Fallback nicht mysteriös wirkt.
  console.warn('[KI-Fallback] ai-fill fehlgeschlagen, nutze autofill. Grund:', aiErrorMessage)
  try {
    const res = await apiFetch(`/api/mealplan/${plan.value.id}/autofill`, { method: 'POST' })
    if (!res.ok) throw new Error(await readApiError(res, 'Automatischer Vorschlag fehlgeschlagen.'))
    await loadDishes()
    syncFromPlan(await res.json())
    notify('KI nicht verfügbar – Gerichte aus deinem Bestand vorgeschlagen. Du kannst sie frei anpassen.', 'info')
    return true
  } catch (e) {
    error.value = aiErrorMessage
    return false
  }
}

// Von den Vorlieben (Schritt 3) weiter zu den KI-Gerichten (Schritt 4)
async function goToGerichte() {
  if (await aiGenerate()) step.value = 4
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

// Plan ausdrucken bzw. als PDF speichern (Browser-Druckdialog -> "Als PDF
// speichern"). Das Druck-Stylesheet (style.css, @media print) blendet alles
// außer dem Plan aus.
function printPlan() {
  window.print()
}
</script>

<template>
  <section class="wizard container">
    <div class="wizard-head no-print">
      <h1>Ernährungsplan erstellen</h1>
      <router-link to="/ernaehrungsplan" class="wizard-exit">Abbrechen</router-link>
    </div>

    <!-- Fortschritts-Anzeige der vier Eingabemasken -->
    <ol class="stepper no-print">
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
          <input v-model="form.name" type="text" required :maxlength="LIMITS.NAME_MAX" placeholder="z. B. Mein Wochenplan" />
        </label>
        <label>
          Ziel
          <select v-model="form.goal">
            <option v-for="(label, key) in GOAL_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </label>
        <label>
          Anzahl Tage (1–7)
          <input
            v-model.number="form.days" type="number"
            :min="LIMITS.DAYS_MIN" :max="LIMITS.DAYS_MAX" required
            @change="clampField('days', LIMITS.DAYS_MIN, LIMITS.DAYS_MAX)"
          />
        </label>
        <div class="wizard-actions">
          <Button type="submit" variant="accent">{{ saving ? 'Speichert …' : 'Weiter' }}</Button>
        </div>
      </form>

      <!-- ===== Schritt 2: Kalorienbedarf (Mifflin-St-Jeor) ===== -->
      <form v-else-if="step === 2" class="wizard-form" @submit.prevent="saveStep2">
        <p class="wizard-hint">
          Aus deinen Körperdaten berechnen wir deinen Tagesbedarf (Mifflin-St-Jeor-Formel).
          Beim nächsten Plan sind diese Werte automatisch vorausgefüllt – du kannst sie
          aber jederzeit anpassen.
        </p>

        <label>
          Geschlecht
          <select v-model="form.sex" @change="saveProfileMetrics">
            <option v-for="s in SEX_OPTIONS" :key="s.key" :value="s.key">{{ s.label }}</option>
          </select>
        </label>

        <div class="metric-row">
          <label>
            Alter (Jahre)
            <input
              v-model.number="form.age" type="number"
              :min="LIMITS.AGE_MIN" :max="LIMITS.AGE_MAX" placeholder="z. B. 25"
              @change="clampMetric('age', LIMITS.AGE_MIN, LIMITS.AGE_MAX)"
            />
          </label>
          <label>
            Größe (cm)
            <input
              v-model.number="form.heightCm" type="number"
              :min="LIMITS.HEIGHT_MIN" :max="LIMITS.HEIGHT_MAX" placeholder="z. B. 178"
              @change="clampMetric('heightCm', LIMITS.HEIGHT_MIN, LIMITS.HEIGHT_MAX)"
            />
          </label>
          <label>
            Gewicht (kg)
            <input
              v-model.number="form.weightKg" type="number"
              :min="LIMITS.WEIGHT_MIN" :max="LIMITS.WEIGHT_MAX" step="0.1" placeholder="z. B. 72"
              @change="clampMetric('weightKg', LIMITS.WEIGHT_MIN, LIMITS.WEIGHT_MAX, false)"
            />
          </label>
        </div>

        <label>
          Aktivitätslevel
          <select v-model="form.activityLevel" @change="saveProfileMetrics">
            <option v-for="a in ACTIVITY_LEVELS" :key="a.key" :value="a.key">{{ a.label }}</option>
          </select>
        </label>

        <!-- Live-Berechnung -->
        <div v-if="recommendedCalories != null" class="calc-result">
          <div class="calc-line"><span>Grundumsatz (BMR)</span><strong>{{ bmr }} kcal</strong></div>
          <div class="calc-line"><span>Tagesbedarf (TDEE)</span><strong>{{ tdee }} kcal</strong></div>
          <div class="calc-line highlight">
            <span>Empfohlen für „{{ GOAL_LABELS[form.goal] }}“</span>
            <strong>{{ recommendedCalories }} kcal/Tag</strong>
          </div>
        </div>
        <p v-else class="wizard-hint">Fülle Alter, Größe und Gewicht aus, um den Bedarf zu berechnen.</p>

        <label>
          Zielkalorien pro Tag (kcal)
          <input
            v-model.number="form.targetCalories"
            type="number"
            :min="LIMITS.CALORIES_MIN"
            :max="LIMITS.CALORIES_MAX"
            step="1"
            required
            @input="targetTouched = true"
            @change="clampField('targetCalories', LIMITS.CALORIES_MIN, LIMITS.CALORIES_MAX)"
          />
        </label>
        <p class="wizard-hint hint-row">
          <button
            v-if="recommendedCalories != null && form.targetCalories !== recommendedCalories"
            type="button"
            class="link-btn"
            @click="applyRecommended"
          >↩ Empfehlung übernehmen ({{ recommendedCalories }} kcal)</button>
          <span>Richtwert je Mahlzeit: ca. {{ Math.round((form.targetCalories || 0) / 3) }} kcal.</span>
        </p>

        <div class="wizard-actions">
          <Button type="button" variant="outline" :onClick="() => (step = 1)">Zurück</Button>
          <Button type="submit" variant="accent">{{ saving ? 'Speichert …' : 'Weiter' }}</Button>
        </div>
      </form>

      <!-- ===== Schritt 3: Vorlieben (für die KI-Generierung) ===== -->
      <form v-else-if="step === 3" class="wizard-form" @submit.prevent="goToGerichte">
        <p class="wizard-hint">
          Sag uns deine Vorlieben – die KI erstellt daraus im nächsten Schritt passende
          Gerichte. Lass „Egal“ stehen, was dir nicht wichtig ist (mindestens eine Frage reicht).
        </p>

        <div class="pref-grid">
          <label v-for="p in DISH_PREFERENCES" :key="p.key">
            {{ p.label }}
            <select v-model="prefs[p.key]">
              <option v-for="opt in p.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </label>
        </div>

        <label>
          Ausschließen (Abneigungen / Allergien)
          <input v-model="exclude" type="text" :maxlength="LIMITS.PREF_TEXT_MAX" placeholder="z. B. keine Erdbeeren, keine Nüsse" />
        </label>
        <label>
          Sonstige Wünsche (optional)
          <input v-model="notes" type="text" :maxlength="LIMITS.PREF_TEXT_MAX" placeholder="z. B. schnelle Rezepte, viel Eiweiß" />
        </label>

        <p v-if="error" class="wizard-msg err">{{ error }}</p>

        <div class="wizard-actions">
          <Button type="button" variant="outline" :onClick="() => (step = 2)">Zurück</Button>
          <Button type="submit" variant="accent">
            {{ saving ? 'Generiere … (bis zu 30 Sek.)' : '✨ Gerichte generieren →' }}
          </Button>
        </div>
      </form>

      <!-- ===== Schritt 4: Gerichte (von der KI erstellt, frei anpassbar) ===== -->
      <div v-else-if="step === 4" class="wizard-form">
        <div class="step3-head">
          <p class="wizard-hint">
            Von der KI erstellt – du kannst jedes Gericht frei ändern. Ziel: {{ form.targetCalories }} kcal/Tag.
          </p>
          <Button type="button" variant="outline" :onClick="aiGenerate">
            {{ saving ? 'Generiere …' : '🔄 Neu generieren' }}
          </Button>
        </div>

        <p v-if="dishes.length === 0" class="wizard-msg err">
          Es wurden noch keine Gerichte erzeugt – versuche „Neu generieren“ (die KI ist evtl. kurz ausgelastet).
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
          <Button type="button" variant="outline" :onClick="() => (step = 3)">Zurück</Button>
          <Button type="button" variant="accent" :onClick="saveStep3">
            {{ saving ? 'Speichert …' : 'Weiter' }}
          </Button>
        </div>
      </div>

      <!-- ===== Schritt 5: Überprüfen & Abschließen ===== -->
      <div v-else-if="step === 5" class="wizard-form">
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

        <div class="wizard-actions no-print">
          <Button type="button" variant="outline" :onClick="printPlan">📄 Als PDF / drucken</Button>
          <Button v-if="!isCompleted" type="button" variant="outline" :onClick="() => (step = 4)">Zurück</Button>
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

/* Schritt 3: Vorlieben-Raster */
.pref-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

/* Schritt 2: Mifflin-Rechner */
.metric-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.metric-row label {
  flex: 1;
  min-width: 120px;
}
.calc-result {
  background: #f7faf2;
  border: 1px solid rgba(124, 179, 66, 0.35);
  border-radius: 10px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.calc-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.92rem;
  color: #555;
}
.calc-line.highlight {
  border-top: 1px solid rgba(124, 179, 66, 0.3);
  margin-top: 0.3rem;
  padding-top: 0.45rem;
  color: var(--color-primary-dark);
  font-size: 1rem;
}
.calc-line.highlight strong {
  font-size: 1.1rem;
}
.hint-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem 1rem;
}
.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-primary-dark);
  font-weight: 700;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  text-decoration: underline;
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
