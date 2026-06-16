<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.js'
import { GOAL_LABELS, PLAN_STATUS_LABELS } from '../config.js'

/**
 * Admin-Nachverfolgung: Übersicht ALLER Ernährungsplan-Vorgänge aller Nutzer.
 * Geschützter Endpunkt /api/admin/mealplans (nur ADMIN). Klick auf eine Zeile
 * öffnet die Detailansicht mit dem vollständigen Ereignis-Protokoll.
 */

const router = useRouter()
const { apiFetch } = useApi()

const plans = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await apiFetch('/api/admin/mealplans')
    if (!res.ok) throw new Error('Vorgänge konnten nicht geladen werden.')
    plans.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function openDetail(plan) {
  router.push(`/admin/ernaehrungsplaene/${plan.id}`)
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <section class="admin-plans container">
    <div class="ap-head">
      <h1>Ernährungsplan-Vorgänge</h1>
      <router-link to="/admin" class="ap-back">← Admin-Bereich</router-link>
    </div>
    <p class="ap-sub">
      Nachvollziehbarkeit aller mehrstufigen Vorgänge: Status, erreichter Schritt
      und Zeitstempel. Für das vollständige Ereignis-Protokoll eine Zeile öffnen.
    </p>

    <p v-if="loading" class="ap-info">Lade …</p>
    <p v-else-if="error" class="ap-msg err">{{ error }}</p>

    <div v-else class="ap-table-wrap">
      <table class="ap-table">
        <thead>
          <tr>
            <th>Besitzer:in</th>
            <th>Plan</th>
            <th>Ziel</th>
            <th>Status</th>
            <th>Schritt</th>
            <th>Gerichte</th>
            <th>Erstellt</th>
            <th>Zuletzt</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in plans" :key="p.id" class="ap-row" @click="openDetail(p)">
            <td>{{ p.ownerName || p.ownerId }}</td>
            <td>{{ p.name || '—' }}</td>
            <td>{{ GOAL_LABELS[p.goal] || '—' }}</td>
            <td>
              <span class="status-badge" :class="p.status === 'COMPLETED' ? 'is-done' : 'is-draft'">
                {{ PLAN_STATUS_LABELS[p.status] || p.status }}
              </span>
            </td>
            <td>
              <span class="step-pill">{{ p.currentStep }}/4</span>
            </td>
            <td>{{ p.entries ? p.entries.length : 0 }}</td>
            <td>{{ formatDate(p.createdAt) }}</td>
            <td>{{ formatDate(p.updatedAt) }}</td>
          </tr>
          <tr v-if="plans.length === 0">
            <td colspan="8" class="ap-empty">Noch keine Vorgänge vorhanden.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.admin-plans {
  max-width: 1040px;
  padding: 3rem 1rem;
}
.ap-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.ap-back {
  font-size: 0.9rem;
  color: #558B2F;
}
.ap-sub {
  color: #555;
  margin: 0.5rem 0 2rem;
}
.ap-info {
  color: #555;
}
.ap-msg.err {
  color: #c62828;
  font-weight: 600;
}

.ap-table-wrap {
  overflow-x: auto;
}
.ap-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 820px;
}
.ap-table th,
.ap-table td {
  text-align: left;
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid #eee;
  font-size: 0.92rem;
}
.ap-table th {
  color: #558B2F;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ap-row {
  cursor: pointer;
}
.ap-row:hover {
  background: #f7faf2;
}
.ap-empty {
  text-align: center;
  color: #888;
  padding: 1.5rem;
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;
}
.status-badge.is-done {
  background: rgba(124, 179, 66, 0.18);
  color: #558B2F;
}
.status-badge.is-draft {
  background: rgba(255, 167, 38, 0.18);
  color: #b26a00;
}
.step-pill {
  display: inline-block;
  background: rgba(0, 0, 0, 0.06);
  color: #555;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
}
</style>
