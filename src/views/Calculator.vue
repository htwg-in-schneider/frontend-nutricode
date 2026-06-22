<script setup>
import { reactive, computed } from 'vue'
import { SEX_OPTIONS, ACTIVITY_LEVELS } from '../constants/nutrition.js'
import { GOAL_LABELS } from '../config.js'
import { calcBmr, calcTdee, calcTargetCalories } from '../utils/mifflin.js'

/**
 * Öffentlicher Kalorienrechner (ohne Anmeldung). Berechnet per Mifflin-St-Jeor
 * Grundumsatz, Tagesbedarf und empfohlene Zielkalorien. Von hier aus kann man –
 * nach Anmeldung – direkt einen Ernährungsplan erstellen.
 */
const form = reactive({
  sex: 'MALE', age: null, heightCm: null, weightKg: null,
  activityLevel: 'MODERATE', goal: 'MAINTAIN',
})

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
        <select v-model="form.sex">
          <option v-for="s in SEX_OPTIONS" :key="s.key" :value="s.key">{{ s.label }}</option>
        </select>
      </label>

      <div class="calc-row">
        <label>
          Alter (Jahre)
          <input v-model.number="form.age" type="number" min="1" max="120" placeholder="z. B. 25" />
        </label>
        <label>
          Größe (cm)
          <input v-model.number="form.heightCm" type="number" min="50" max="250" placeholder="z. B. 178" />
        </label>
        <label>
          Gewicht (kg)
          <input v-model.number="form.weightKg" type="number" min="20" max="400" step="0.1" placeholder="z. B. 72" />
        </label>
      </div>

      <label>
        Aktivitätslevel
        <select v-model="form.activityLevel">
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
      <router-link to="/ernaehrungsplan/neu" class="btn btn-accent">
        Jetzt Ernährungsplan erstellen →
      </router-link>
      <span class="calc-cta-note">Anmeldung erforderlich · mit KI-generierten Gerichten</span>
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
