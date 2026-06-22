<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.js'
import { useDialog } from '../composables/useDialog.js'
import { CATEGORY_LABELS } from '../config.js'

/**
 * Stammdaten: Gerichte-Verwaltung (nur ADMIN). Als Admin liefert /api/dish die
 * globalen Vorlagen-Gerichte. Hier: ansehen, suchen/filtern, anlegen (Formular
 * /dish/new), bearbeiten (/dish/:id/edit) und löschen. Volles CRUD über die
 * bereits vorhandenen REST-Endpunkte des DishControllers.
 */

const router = useRouter()
const { apiFetch } = useApi()
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
    if (!res.ok) throw new Error('Gerichte konnten nicht geladen werden.')
    dishes.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)

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
    <div class="ad-head">
      <h1>Gerichte verwalten</h1>
      <router-link to="/admin" class="ad-back">← Admin-Bereich</router-link>
    </div>
    <p class="ad-sub">
      Stammdaten der globalen Vorlagen-Gerichte. Sie dienen allen neuen
      Nutzer:innen als Startbestand.
    </p>

    <div class="ad-toolbar">
      <input
        v-model="search"
        type="search"
        class="ad-search"
        placeholder="Gericht suchen …"
      />
      <select v-model="categoryFilter" class="ad-filter">
        <option value="">Alle Kategorien</option>
        <option v-for="(label, key) in CATEGORY_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
      <router-link to="/dish/new" class="btn btn-accent ad-new">+ Neues Gericht</router-link>
    </div>

    <p v-if="error" class="ad-msg err">{{ error }}</p>
    <p v-if="loading" class="ad-info">Lade Gerichte …</p>

    <div v-else class="ad-table-wrap">
      <table class="ad-table responsive-table">
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
            <td data-label="Titel" class="ad-title">{{ d.title }}</td>
            <td data-label="Kategorie">{{ CATEGORY_LABELS[d.category] || d.category }}</td>
            <td data-label="Kalorien">{{ d.calories }} kcal</td>
            <td class="ad-actions cell-actions">
              <router-link :to="`/dish/${d.id}`" class="btn btn-outline ad-btn">Ansehen</router-link>
              <button type="button" class="btn btn-outline ad-btn" @click="router.push(`/dish/${d.id}/edit`)">
                Bearbeiten
              </button>
              <button type="button" class="btn btn-danger ad-btn" @click="remove(d)">Löschen</button>
            </td>
          </tr>
          <tr v-if="filteredDishes.length === 0">
            <td colspan="4" class="ad-empty">Keine Gerichte gefunden.</td>
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
.ad-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.ad-back {
  font-size: 0.9rem;
  color: var(--color-primary-dark);
}
.ad-sub {
  color: #555;
  margin: 0.5rem 0 1.5rem;
}
.ad-toolbar {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.ad-search {
  flex: 1;
  min-width: 200px;
  padding: 0.7rem 0.9rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}
.ad-filter {
  padding: 0.7rem 0.9rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
}
.ad-new {
  white-space: nowrap;
}
.ad-info {
  color: #555;
}
.ad-msg.err {
  color: var(--color-danger);
  font-weight: 600;
}

.ad-table-wrap {
  overflow-x: auto;
}
.ad-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}
.ad-table th,
.ad-table td {
  text-align: left;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid #eee;
  font-size: 0.93rem;
  vertical-align: middle;
}
.ad-table th {
  color: var(--color-primary-dark);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ad-title {
  font-weight: 600;
}
.ad-actions {
  display: flex;
  gap: 0.4rem;
  white-space: nowrap;
}
.ad-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.83rem;
}
.ad-empty {
  text-align: center;
  color: #888;
  padding: 1.5rem;
}
</style>
