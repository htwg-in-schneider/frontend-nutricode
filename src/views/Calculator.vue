<script setup>
import { reactive, ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { SEX_OPTIONS, ACTIVITY_LEVELS } from '../constants/nutrition.js'
import { GOAL_LABELS } from '../config.js'
import { LIMITS } from '../constants/validation.js'
import { clampNumber } from '../utils/clamp.js'
import { calcBmr, calcTdee, calcTargetCalories } from '../utils/mifflin.js'
import { stashPendingMetrics } from '../utils/pendingMetrics.js'
import { useApi } from '../composables/useApi.js'
import { useRoles } from '../composables/useRoles.js'

/**
 * Öffentlicher Kalorienrechner (ohne Anmeldung). Berechnet per Mifflin-St-Jeor
 * Grundumsatz, Tagesbedarf und empfohlene Zielkalorien.
 *
 * Eingeloggt ist das Profil die einzige Quelle der Wahrheit: Die Körperdaten
 * werden beim Öffnen aus dem Profil vorausgefüllt und bei jeder Änderung
 * automatisch dorthin zurückgespeichert (ohne Weiterleitung). Von hier aus
 * gelangt man – nach Anmeldung – direkt in den Ernährungsplan-Wizard.
 */
const router = useRouter()
const { apiFetch } = useApi()
const { loginWithRedirect } = useAuth0()
const { isAuthenticated, isLoading } = useRoles()

const form = reactive({
  sex: 'MALE', age: null, heightCm: null, weightKg: null,
  activityLevel: 'MODERATE', goal: 'MAINTAIN',
})

// Kurzes "gespeichert"-Feedback nach dem automatischen Speichern ins Profil.
const savedHint = ref(false)
let savedTimer = null

// Nur die Körperdaten (ohne Ziel – das Ziel gehört zum Plan, nicht ins Profil).
function metricsPayload() {
  return {
    sex: form.sex,
    age: form.age !== null && form.age !== '' ? Number(form.age) : null,
    heightCm: form.heightCm !== null && form.heightCm !== '' ? Number(form.heightCm) : null,
    weightKg: form.weightKg !== null && form.weightKg !== '' ? Number(form.weightKg) : null,
    activityLevel: form.activityLevel,
  }
}

// Körperdaten ins Profil speichern (nur eingeloggt). Fehler werden bewusst
// geschluckt: ein noch unvollständiger Wert darf den Rechner nicht stören.
async function persistMetrics() {
  if (!isAuthenticated.value) return
  try {
    const res = await apiFetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metricsPayload()),
    })
    if (!res.ok) return
    savedHint.value = true
    clearTimeout(savedTimer)
    savedTimer = setTimeout(() => { savedHint.value = false }, 2000)
  } catch (e) {
    // Speichern ist optional – der Wert bleibt im Zweifel nur lokal im Formular
  }
}

// Eingaben beim Verlassen des Feldes begrenzen UND (eingeloggt) ins Profil sichern.
function clampField(key, min, max, integer = true) {
  form[key] = clampNumber(form[key], min, max, { integer })
  persistMetrics()
}

// Profil-Körperdaten in den Rechner laden (sobald Auth0 bereit & eingeloggt),
// damit der Rechner mit den gespeicherten Werten vorausgefüllt ist.
async function loadProfileIntoForm() {
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
    // Profil optional – dann bleiben die Standardwerte stehen
  }
}

// Erst laden, wenn Auth0 fertig geladen ist; bei Login erneut vorausfüllen.
watch([isLoading, isAuthenticated], ([loading, authed]) => {
  if (loading) return
  if (authed) loadProfileIntoForm()
}, { immediate: true })

onUnmounted(() => clearTimeout(savedTimer))

// Weiter in den Plan-Wizard.
//  - Eingeloggt: Körperdaten sicher ins Profil übernehmen, dann in den Wizard
//    (dort vorausgefüllt und weiterhin frei editierbar).
//  - Nicht eingeloggt: Werte zwischenspeichern und über den Auth0-Login in den
//    Wizard leiten. Nach dem Login werden sie dort einmalig ins Profil übernommen.
async function startPlan() {
  if (isAuthenticated.value) {
    await persistMetrics()
    router.push('/ernaehrungsplan/neu')
    return
  }
  stashPendingMetrics(metricsPayload())
  try {
    await loginWithRedirect({ appState: { target: '/ernaehrungsplan/neu' } })
  } catch (e) {
    console.error('[Auth0] Login fehlgeschlagen:', e)
  }
}

const bmr = computed(() => calcBmr(form))
const tdee = computed(() => calcTdee(form))
const target = computed(() => calcTargetCalories(form, form.goal))
</script>

<template>
  <section class="calc container">
    <div class="section-header">
      <p class="section-tag">Kostenlos & ohne Anmeldung</p>
      <h1 class="section-title">Kalorienrechner</h1>
    </div>
    <p class="calc-intro">
      Berechne deinen täglichen Kalorienbedarf nach der Mifflin-St-Jeor-Formel –
      ganz ohne Login. Für einen kompletten Plan kannst du dich danach anmelden.
    </p>

    <form class="calc-form" @submit.prevent>
      <label>
        Geschlecht
        <select v-model="form.sex" @change="persistMetrics">
          <option v-for="s in SEX_OPTIONS" :key="s.key" :value="s.key">{{ s.label }}</option>
        </select>
      </label>

      <div class="calc-row">
        <label>
          Alter (Jahre)
          <input
            v-model.number="form.age" type="number"
            :min="LIMITS.AGE_MIN" :max="LIMITS.AGE_MAX" placeholder="z. B. 25"
            @change="clampField('age', LIMITS.AGE_MIN, LIMITS.AGE_MAX)"
          />
        </label>
        <label>
          Größe (cm)
          <input
            v-model.number="form.heightCm" type="number"
            :min="LIMITS.HEIGHT_MIN" :max="LIMITS.HEIGHT_MAX" placeholder="z. B. 178"
            @change="clampField('heightCm', LIMITS.HEIGHT_MIN, LIMITS.HEIGHT_MAX)"
          />
        </label>
        <label>
          Gewicht (kg)
          <input
            v-model.number="form.weightKg" type="number"
            :min="LIMITS.WEIGHT_MIN" :max="LIMITS.WEIGHT_MAX" step="0.1" placeholder="z. B. 72"
            @change="clampField('weightKg', LIMITS.WEIGHT_MIN, LIMITS.WEIGHT_MAX, false)"
          />
        </label>
      </div>

      <label>
        Aktivitätslevel
        <select v-model="form.activityLevel" @change="persistMetrics">
          <option v-for="a in ACTIVITY_LEVELS" :key="a.key" :value="a.key">{{ a.label }}</option>
        </select>
      </label>

      <label>
        Ziel
        <select v-model="form.goal">
          <option v-for="(label, key) in GOAL_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </label>
    </form>

    <!-- Hinweis: eingeloggt werden die Werte automatisch im Profil gespeichert -->
    <p v-if="isAuthenticated" class="calc-saved-note" :class="{ ok: savedHint }">
      {{ savedHint
        ? 'Im Profil gespeichert ✓'
        : 'Angemeldet – deine Eingaben werden automatisch in deinem Profil gespeichert.' }}
    </p>

    <!-- Live-Ergebnis -->
    <div v-if="target != null" class="calc-result">
      <div class="calc-line"><span>Grundumsatz (BMR)</span><strong>{{ bmr }} kcal</strong></div>
      <div class="calc-line"><span>Tagesbedarf (TDEE)</span><strong>{{ tdee }} kcal</strong></div>
      <div class="calc-line highlight">
        <span>Empfohlen für „{{ GOAL_LABELS[form.goal] }}“</span>
        <strong>{{ target }} kcal/Tag</strong>
      </div>
    </div>
    <p v-else class="calc-hint">Fülle Alter, Größe und Gewicht aus, um deinen Bedarf zu berechnen.</p>

    <!-- Weiterführung in den Plan-Wizard (Login erforderlich) -->
    <div class="calc-cta">
      <button type="button" class="btn btn-accent" @click="startPlan">
        Jetzt Ernährungsplan erstellen →
      </button>
      <span class="calc-cta-note">
        {{ isAuthenticated
          ? 'Deine Werte sind im Profil gespeichert – im Wizard anpassbar.'
          : 'Anmeldung erforderlich · deine Eingaben werden übernommen' }}
      </span>
    </div>
  </section>
</template>

<style scoped>
.calc {
  max-width: 720px;
  padding: 3rem 1rem;
}
.calc-intro {
  text-align: center;
  color: #555;
  max-width: 560px;
  margin: 0 auto 2rem;
}
.calc-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.calc-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.calc-row label {
  flex: 1;
  min-width: 140px;
}
.calc-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 600;
  color: #444;
}
.calc-form input,
.calc-form select {
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}
.calc-result {
  background: #f7faf2;
  border: 1px solid rgba(124, 179, 66, 0.35);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 1.5rem;
}
.calc-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.95rem;
  color: #555;
}
.calc-line.highlight {
  border-top: 1px solid rgba(124, 179, 66, 0.3);
  margin-top: 0.3rem;
  padding-top: 0.5rem;
  color: var(--color-primary-dark);
  font-size: 1.05rem;
}
.calc-line.highlight strong {
  font-size: 1.2rem;
}
.calc-hint {
  margin-top: 1.5rem;
  color: #666;
  text-align: center;
}
.calc-saved-note {
  margin-top: 0.6rem;
  text-align: center;
  font-size: 0.82rem;
  color: #888;
}
.calc-saved-note.ok {
  color: var(--color-primary-dark);
  font-weight: 600;
}
.calc-cta {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.calc-cta-note {
  font-size: 0.82rem;
  color: #888;
}
</style>
