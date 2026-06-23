<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.js'
import { useRoles } from '../composables/useRoles.js'
import { useDialog } from '../composables/useDialog.js'
import { readApiError } from '../utils/apiError.js'
import { CATEGORY_LABELS } from '../config.js'

/**
 * Stammdaten: Gerichte-Verwaltung (nur ADMIN). Als Admin liefert /api/dish die
 * globalen Vorlagen-Gerichte. Hier: ansehen, suchen/filtern, anlegen (Formular
 * /dish/new), bearbeiten (/dish/:id/edit) und löschen. Volles CRUD über die
 * bereits vorhandenen REST-Endpunkte des DishControllers.
 */

const router = useRouter()
const { apiFetch } = useApi()
const { isLoading, isAuthenticated } = useRoles()
const { confirm } = useDialog()

const dishes = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const categoryFilter = ref('')

const filteredDishes = computed(() => {
  const q = search.value.trim().toLowerCase()
  return dishes.value.filter((d) => {
    const matchesText = !q || (d.title && d.title.toLowerCase().includes(q))
    const matchesCat = !categoryFilter.value || d.category === categoryFilter.value
    return matchesText && matchesCat
  })
})

async function load() {
  loading.value = true
  error.value = null
  try {
    // Als Admin -> globale Vorlagen-Gerichte (Stammdaten)
    const res = await apiFetch('/api/dish')
    if (!res.ok) {
      throw new Error(await readApiError(res, `Gerichte konnten nicht geladen werden (HTTP ${res.status}).`))
    }
    dishes.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Erst laden, wenn Auth0 fertig initialisiert ist (sonst geht der erste Request
// raus, bevor der Token bereit ist – wie bei DishCatalog). Reagiert zusätzlich
// auf Login/Logout.
watch(
  [isLoading, isAuthenticated],
  ([loading]) => {
    if (loading) return
    load()
  },
  { immediate: true },
)

async function remove(dish) {
  const ok = await confirm(`Gericht „${dish.title}“ wirklich löschen?`, {
    title: 'Gericht löschen', confirmText: 'Löschen', danger: true,
  })
  if (!ok) return
  error.value = null
  try {
    const res = await apiFetch(`/api/dish/${dish.id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) throw new Error('Löschen fehlgeschlagen.')
    dishes.value = dishes.value.filter((d) => d.id !== dish.id)
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <section class="admin-dishes container">
    <div class="gv-head">
      <h1>Gerichte verwalten</h1>
      <router-link to="/admin" class="gv-back">← Admin-Bereich</router-link>
    </div>
    <p class="gv-sub">
      Stammdaten der globalen Vorlagen-Gerichte. Sie dienen allen neuen
      Nutzer:innen als Startbestand.
    </p>

    <div class="gv-toolbar">
      <input
        v-model="search"
        type="search"
        class="gv-search"
        placeholder="Gericht suchen …"
      />
      <select v-model="categoryFilter" class="gv-filter">
        <option value="">Alle Kategorien</option>
        <option v-for="(label, key) in CATEGORY_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
      <router-link to="/dish/new" class="btn btn-accent gv-new">+ Neues Gericht</router-link>
    </div>

    <p v-if="error" class="gv-msg err">{{ error }}</p>
    <p v-if="loading" class="gv-info">Lade Gerichte …</p>

    <div v-else class="gv-table-wrap">
      <table class="gv-table responsive-table">
        <thead>
          <tr>
            <th>Titel</th>
            <th>Kategorie</th>
            <th>Kalorien</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in filteredDishes" :key="d.id">
            <td data-label="Titel" class="gv-title">{{ d.title }}</td>
            <td data-label="Kategorie">{{ CATEGORY_LABELS[d.category] || d.category }}</td>
            <td data-label="Kalorien">{{ d.calories }} kcal</td>
            <td class="gv-actions cell-actions">
              <router-link :to="`/dish/${d.id}`" class="btn btn-outline gv-btn">Ansehen</router-link>
              <button type="button" class="btn btn-outline gv-btn" @click="router.push(`/dish/${d.id}/edit`)">
                Bearbeiten
              </button>
              <button type="button" class="btn btn-danger gv-btn" @click="remove(d)">Löschen</button>
            </td>
          </tr>
          <tr v-if="filteredDishes.length === 0">
            <td colspan="4" class="gv-empty">Keine Gerichte gefunden.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.admin-dishes {
  max-width: 1000px;
  padding: 3rem 1rem;
}
.gv-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.gv-back {
  font-size: 0.9rem;
  color: var(--color-primary-dark);
}
.gv-sub {
  color: #555;
  margin: 0.5rem 0 1.5rem;
}
.gv-toolbar {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.gv-search {
  flex: 1;
  min-width: 200px;
  padding: 0.7rem 0.9rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}
.gv-filter {
  padding: 0.7rem 0.9rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
}
.gv-new {
  white-space: nowrap;
}
.gv-info {
  color: #555;
}
.gv-msg.err {
  color: var(--color-danger);
  font-weight: 600;
}

.gv-table-wrap {
  overflow-x: auto;
}
.gv-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}
.gv-table th,
.gv-table td {
  text-align: left;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid #eee;
  font-size: 0.93rem;
  vertical-align: middle;
}
.gv-table th {
  color: var(--color-primary-dark);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.gv-title {
  font-weight: 600;
}
.gv-actions {
  display: flex;
  gap: 0.4rem;
  white-space: nowrap;
}
.gv-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.83rem;
}
.gv-empty {
  text-align: center;
  color: #888;
  padding: 1.5rem;
}
</style>
