<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../components/Button.vue'
import { useApi } from '../composables/useApi.js'
import { GOAL_LABELS, PLAN_STATUS_LABELS } from '../config.js'

/**
 * Übersicht der eigenen Ernährungspläne. Entwürfe (DRAFT) lassen sich fortsetzen,
 * abgeschlossene Pläne ansehen. Einstiegspunkt in den mehrstufigen Vorgang.
 */

const router = useRouter()
const { apiFetch } = useApi()

const plans = ref([])
const loading = ref(true)
const error = ref(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await apiFetch('/api/mealplan')
    if (!res.ok) throw new Error('Pläne konnten nicht geladen werden.')
    plans.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)

function open(plan) {
  router.push(`/ernaehrungsplan/${plan.id}`)
}

async function remove(plan) {
  if (!confirm(`Plan „${plan.name}“ wirklich löschen?`)) return
  try {
    const res = await apiFetch(`/api/mealplan/${plan.id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) throw new Error('Löschen fehlgeschlagen.')
    plans.value = plans.value.filter((p) => p.id !== plan.id)
  } catch (e) {
    error.value = e.message
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <section class="plans container">
    <div class="plans-head">
      <div>
        <h1>Meine Ernährungspläne</h1>
        <p class="plans-sub">
          Erstelle in vier Schritten deinen persönlichen Plan – jeder Zwischenstand
          wird automatisch gespeichert.
        </p>
      </div>
      <Button type="button" variant="accent" :onClick="() => router.push('/ernaehrungsplan/neu')">
        + Neuen Plan erstellen
      </Button>
    </div>

    <p v-if="loading" class="plans-info">Lade …</p>
    <p v-else-if="error" class="plans-msg err">{{ error }}</p>

    <p v-else-if="plans.length === 0" class="plans-empty">
      Noch keine Pläne vorhanden. Starte deinen ersten Ernährungsplan!
    </p>

    <ul v-else class="plan-cards">
      <li v-for="p in plans" :key="p.id" class="plan-card">
        <div class="plan-card-main">
          <div class="plan-card-titlerow">
            <h2>{{ p.name || 'Unbenannter Plan' }}</h2>
            <span class="status-badge" :class="p.status === 'COMPLETED' ? 'is-done' : 'is-draft'">
              {{ PLAN_STATUS_LABELS[p.status] || p.status }}
            </span>
          </div>
          <p class="plan-card-meta">
            {{ GOAL_LABELS[p.goal] || '—' }} · {{ p.days }} Tage · {{ p.targetCalories }} kcal/Tag
          </p>
          <p class="plan-card-sub">
            <template v-if="p.status === 'DRAFT'">Schritt {{ p.currentStep }} von 4 · </template>
            Zuletzt bearbeitet: {{ formatDate(p.updatedAt) }}
          </p>
        </div>
        <div class="plan-card-actions">
          <Button type="button" variant="accent" :onClick="() => open(p)">
            {{ p.status === 'DRAFT' ? 'Fortsetzen' : 'Ansehen' }}
          </Button>
          <button type="button" class="btn btn-danger plan-del" @click="remove(p)">Löschen</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.plans {
  max-width: 820px;
  padding: 3rem 1rem;
}
.plans-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}
.plans-sub {
  color: #555;
  margin-top: 0.4rem;
  max-width: 480px;
}
.plans-info {
  color: #555;
}
.plans-msg.err {
  color: var(--color-danger);
  font-weight: 600;
}
.plans-empty {
  color: #888;
  padding: 2rem 0;
}

.plan-cards {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.plan-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.1rem 1.3rem;
  flex-wrap: wrap;
}
.plan-card:hover {
  background: #f7faf2;
}
.plan-card-titlerow {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.plan-card-titlerow h2 {
  font-size: 1.15rem;
}
.plan-card-meta {
  color: #444;
  margin-top: 0.3rem;
  font-size: 0.92rem;
}
.plan-card-sub {
  color: #888;
  font-size: 0.82rem;
  margin-top: 0.2rem;
}
.plan-card-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.plan-del {
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
.status-badge.is-done {
  background: rgba(124, 179, 66, 0.18);
  color: var(--color-primary-dark);
}
.status-badge.is-draft {
  background: rgba(255, 167, 38, 0.18);
  color: #b26a00;
}
</style>
