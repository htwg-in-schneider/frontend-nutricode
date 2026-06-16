<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '../composables/useApi.js'
import { GOAL_LABELS, PLAN_STATUS_LABELS, MEAL_SLOTS } from '../config.js'

/**
 * Admin-Detailansicht eines einzelnen Vorgangs. Zeigt den vollständigen Plan
 * (Gerichte je Tag) und vor allem die ZEITLEISTE des Ereignis-Protokolls –
 * damit lässt sich der mehrstufige Vorgang Schritt für Schritt nachvollziehen.
 */

const route = useRoute()
const { apiFetch } = useApi()

const plan = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await apiFetch(`/api/admin/mealplans/${route.params.id}`)
    if (!res.ok) throw new Error('Vorgang konnte nicht geladen werden.')
    plan.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const days = computed(() => (plan.value ? Array.from({ length: plan.value.days }, (_, i) => i) : []))

function entryFor(day, slotKey) {
  return (plan.value?.entries || []).find((e) => e.dayIndex === day && e.slot === slotKey)
}

function dayCalories(day) {
  return (plan.value?.entries || [])
    .filter((e) => e.dayIndex === day)
    .reduce((sum, e) => sum + (e.calories || 0), 0)
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}
</script>

<template>
  <section class="apd container">
    <div class="apd-head">
      <h1>Vorgang-Detail</h1>
      <router-link to="/admin/ernaehrungsplaene" class="apd-back">← Alle Vorgänge</router-link>
    </div>

    <p v-if="loading" class="apd-info">Lade …</p>
    <p v-else-if="error" class="apd-msg err">{{ error }}</p>

    <template v-else-if="plan">
      <!-- Kopfdaten -->
      <div class="apd-card">
        <div class="apd-titlerow">
          <h2>{{ plan.name || 'Unbenannter Plan' }}</h2>
          <span class="status-badge" :class="plan.status === 'COMPLETED' ? 'is-done' : 'is-draft'">
            {{ PLAN_STATUS_LABELS[plan.status] || plan.status }}
          </span>
        </div>
        <dl class="apd-meta">
          <div><dt>Besitzer:in</dt><dd>{{ plan.ownerName || plan.ownerId }}</dd></div>
          <div><dt>Ziel</dt><dd>{{ GOAL_LABELS[plan.goal] || '—' }}</dd></div>
          <div><dt>Tage</dt><dd>{{ plan.days }}</dd></div>
          <div><dt>Zielkalorien</dt><dd>{{ plan.targetCalories }} kcal/Tag</dd></div>
          <div><dt>Erreichter Schritt</dt><dd>{{ plan.currentStep }} / 4</dd></div>
          <div><dt>Erstellt</dt><dd>{{ formatDate(plan.createdAt) }}</dd></div>
          <div><dt>Zuletzt bearbeitet</dt><dd>{{ formatDate(plan.updatedAt) }}</dd></div>
          <div><dt>Abgeschlossen</dt><dd>{{ formatDate(plan.completedAt) }}</dd></div>
        </dl>
      </div>

      <div class="apd-grid">
        <!-- Gewählte Gerichte -->
        <div class="apd-section">
          <h3>Gewählte Gerichte</h3>
          <p v-if="(plan.entries || []).length === 0" class="muted">Noch keine Gerichte gewählt.</p>
          <div v-for="day in days" :key="day" class="apd-day">
            <h4>Tag {{ day + 1 }} <span class="apd-day-sum">{{ dayCalories(day) }} kcal</span></h4>
            <ul>
              <li v-for="s in MEAL_SLOTS" :key="s.key">
                <span class="slot-label">{{ s.label }}:</span>
                <span v-if="entryFor(day, s.key)">
                  {{ entryFor(day, s.key).dishTitle }} ({{ entryFor(day, s.key).calories }} kcal)
                </span>
                <span v-else class="muted">– keine –</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Ereignis-Protokoll (Zeitleiste) -->
        <div class="apd-section">
          <h3>Ereignis-Protokoll</h3>
          <ol class="timeline">
            <li v-for="ev in plan.events" :key="ev.id" class="timeline-item">
              <span class="timeline-dot">{{ ev.step }}</span>
              <div class="timeline-body">
                <p class="timeline-msg">{{ ev.message }}</p>
                <p class="timeline-time">{{ formatDate(ev.timestamp) }}</p>
              </div>
            </li>
            <li v-if="!plan.events || plan.events.length === 0" class="muted">
              Keine Ereignisse protokolliert.
            </li>
          </ol>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.apd {
  max-width: 980px;
  padding: 3rem 1rem;
}
.apd-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.apd-back {
  font-size: 0.9rem;
  color: #558B2F;
}
.apd-info {
  color: #555;
}
.apd-msg.err {
  color: #c62828;
  font-weight: 600;
}

.apd-card {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.3rem 1.5rem;
  margin-bottom: 1.5rem;
}
.apd-titlerow {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}
.apd-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem 1.5rem;
}
.apd-meta dt {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #558B2F;
}
.apd-meta dd {
  font-weight: 600;
  color: #333;
}

.apd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 760px) {
  .apd-grid {
    grid-template-columns: 1fr;
  }
}
.apd-section h3 {
  margin-bottom: 1rem;
  color: #444;
}
.apd-day {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  margin-bottom: 0.8rem;
}
.apd-day h4 {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.4rem;
}
.apd-day-sum {
  font-size: 0.8rem;
  color: #558B2F;
  font-weight: 700;
}
.apd-day ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.slot-label {
  display: inline-block;
  width: 100px;
  font-weight: 600;
  color: #444;
}
.muted {
  color: #999;
}

/* Zeitleiste */
.timeline {
  list-style: none;
  position: relative;
  padding-left: 0.5rem;
}
.timeline-item {
  display: flex;
  gap: 0.9rem;
  padding-bottom: 1.1rem;
  position: relative;
}
.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 0.85rem;
  top: 1.8rem;
  bottom: 0;
  width: 2px;
  background: #e3e9d8;
}
.timeline-dot {
  flex-shrink: 0;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 999px;
  background: #7CB342;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  z-index: 1;
}
.timeline-msg {
  font-weight: 600;
  color: #333;
}
.timeline-time {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.15rem;
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
.status-badge.is-done {
  background: rgba(124, 179, 66, 0.18);
  color: #558B2F;
}
.status-badge.is-draft {
  background: rgba(255, 167, 38, 0.18);
  color: #b26a00;
}
</style>
