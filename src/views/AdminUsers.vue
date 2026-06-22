<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'
import { readApiError } from '../utils/apiError.js'
import { LIMITS } from '../constants/validation.js'

/**
 * Stammdaten: Benutzerverwaltung (nur ADMIN). Anzeigen, Durchsuchen und
 * Bearbeiten (Name, Adresse, Rolle). Anlegen/Löschen ist laut Aufgabe nicht
 * nötig – die Konten kommen aus Auth0. Die Rolle hier ist die lokale Anzeige;
 * die tatsächlichen Rechte ergeben sich aus dem Auth0-Token.
 */

const { apiFetch } = useApi()

const ROLE_LABELS = { ADMIN: 'Administrator:in', USER: 'Benutzer:in' }
const ROLES = ['USER', 'ADMIN']

const users = ref([])
const loading = ref(true)
const error = ref(null)
const message = ref(null)
const search = ref('')

const editId = ref(null)               // oauthId des Benutzers im Bearbeiten-Modus
const draft = ref({ name: '', address: '', role: 'USER' })

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter((u) =>
    [u.name, u.email, u.address, ROLE_LABELS[u.role]]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q))
  )
})

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await apiFetch('/api/admin/users')
    if (!res.ok) throw new Error('Benutzerliste konnte nicht geladen werden.')
    users.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)

function startEdit(u) {
  editId.value = u.oauthId
  draft.value = { name: u.name || '', address: u.address || '', role: u.role || 'USER' }
  message.value = null
}

function cancelEdit() {
  editId.value = null
}

async function saveEdit(u) {
  error.value = null
  try {
    const res = await apiFetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oauthId: u.oauthId,
        name: draft.value.name,
        address: draft.value.address,
        role: draft.value.role,
      }),
    })
    if (!res.ok) throw new Error(await readApiError(res, 'Speichern fehlgeschlagen.'))
    const updated = await res.json()
    const i = users.value.findIndex((x) => x.oauthId === updated.oauthId)
    if (i !== -1) users.value[i] = updated
    editId.value = null
    message.value = `Benutzer „${updated.name || updated.email}“ gespeichert.`
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <section class="admin-users container">
    <div class="au-head">
      <h1>Benutzer verwalten</h1>
      <router-link to="/admin" class="au-back">← Admin-Bereich</router-link>
    </div>
    <p class="au-sub">
      Benutzerdaten ansehen, durchsuchen und bearbeiten. Neue Konten werden in
      Auth0 angelegt, daher kein „Neu" hier.
    </p>

    <input
      v-model="search"
      type="search"
      class="au-search"
      placeholder="Suchen nach Name, E-Mail, Adresse oder Rolle …"
    />

    <p v-if="message" class="au-msg ok">{{ message }}</p>
    <p v-if="error" class="au-msg err">{{ error }}</p>
    <p v-if="loading" class="au-info">Lade Benutzer …</p>

    <div v-else class="au-table-wrap">
      <table class="au-table responsive-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Adresse</th>
            <th>Rolle</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.oauthId">
            <!-- Bearbeiten-Modus -->
            <template v-if="editId === u.oauthId">
              <td data-label="Name"><input v-model="draft.name" type="text" :maxlength="LIMITS.NAME_MAX" class="au-input" /></td>
              <td data-label="E-Mail" class="au-muted">{{ u.email || '—' }}</td>
              <td data-label="Adresse"><input v-model="draft.address" type="text" :maxlength="LIMITS.ADDRESS_MAX" class="au-input" /></td>
              <td data-label="Rolle">
                <select v-model="draft.role" class="au-input">
                  <option v-for="r in ROLES" :key="r" :value="r">{{ ROLE_LABELS[r] }}</option>
                </select>
              </td>
              <td class="au-actions cell-actions">
                <button type="button" class="btn btn-accent au-btn" @click="saveEdit(u)">Speichern</button>
                <button type="button" class="btn btn-outline au-btn" @click="cancelEdit">Abbrechen</button>
              </td>
            </template>

            <!-- Anzeige-Modus -->
            <template v-else>
              <td data-label="Name">{{ u.name || '—' }}</td>
              <td data-label="E-Mail">{{ u.email || '—' }}</td>
              <td data-label="Adresse">{{ u.address || '—' }}</td>
              <td data-label="Rolle">
                <span class="role-badge" :class="u.role === 'ADMIN' ? 'role-admin' : 'role-user'">
                  {{ ROLE_LABELS[u.role] || u.role }}
                </span>
              </td>
              <td class="au-actions cell-actions">
                <button type="button" class="btn btn-outline au-btn" @click="startEdit(u)">Bearbeiten</button>
              </td>
            </template>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="au-empty">Keine Benutzer gefunden.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.admin-users {
  max-width: 1000px;
  padding: 3rem 1rem;
}
.au-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.au-back {
  font-size: 0.9rem;
  color: var(--color-primary-dark);
}
.au-sub {
  color: #555;
  margin: 0.5rem 0 1.5rem;
}
.au-search {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  margin-bottom: 1.5rem;
}
.au-info {
  color: #555;
}
.au-msg.ok {
  color: var(--color-primary-dark);
  font-weight: 600;
}
.au-msg.err {
  color: var(--color-danger);
  font-weight: 600;
}

.au-table-wrap {
  overflow-x: auto;
}
.au-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}
.au-table th,
.au-table td {
  text-align: left;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid #eee;
  font-size: 0.93rem;
  vertical-align: middle;
}
.au-table th {
  color: var(--color-primary-dark);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.au-muted {
  color: #888;
}
.au-input {
  width: 100%;
  padding: 0.4rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
}
.au-actions {
  display: flex;
  gap: 0.4rem;
  white-space: nowrap;
}
.au-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.83rem;
}
.au-empty {
  text-align: center;
  color: #888;
  padding: 1.5rem;
}

.role-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
.role-admin {
  background: rgba(124, 179, 66, 0.18);
  color: var(--color-primary-dark);
}
.role-user {
  background: rgba(0, 0, 0, 0.06);
  color: #555;
}
</style>
