<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'

const { apiFetch } = useApi()

// Deutsche Anzeige-Namen der Rollen
const ROLE_LABELS = { ADMIN: 'Administrator:in', USER: 'Benutzer:in' }

const users = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    // Geschützter Endpunkt: liefert nur mit gültigem ADMIN-Token Daten
    const res = await apiFetch('/api/admin/users')
    if (!res.ok) throw new Error('Benutzerliste konnte nicht geladen werden.')
    users.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="admin container">
    <h1>Admin-Bereich</h1>
    <p class="admin-sub">
      Benutzerverwaltung – dieser Bereich ist ausschließlich für
      Administrator:innen zugänglich.
    </p>

    <router-link to="/admin/ernaehrungsplaene" class="admin-link-card">
      <div>
        <strong>Ernährungsplan-Vorgänge nachverfolgen</strong>
        <span>Alle mehrstufigen Vorgänge mit Status, Schritt und Ereignis-Protokoll ansehen.</span>
      </div>
      <span class="admin-link-arrow">→</span>
    </router-link>

    <h2 class="admin-section-title">Benutzer</h2>

    <p v-if="loading" class="admin-info">Lade Benutzer …</p>
    <p v-else-if="error" class="admin-msg err">{{ error }}</p>

    <div v-else class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Rolle</th>
            <th>Adresse</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.oauthId">
            <td>{{ u.name || '—' }}</td>
            <td>{{ u.email || '—' }}</td>
            <td>
              <span
                class="role-badge"
                :class="u.role === 'ADMIN' ? 'role-admin' : 'role-user'"
              >
                {{ ROLE_LABELS[u.role] || u.role }}
              </span>
            </td>
            <td>{{ u.address || '—' }}</td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="4" class="admin-empty">Keine Benutzer vorhanden.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.admin {
  max-width: 900px;
  padding: 3rem 1rem;
}
.admin h1 {
  margin-bottom: 0.5rem;
}
.admin-sub {
  color: #555;
  margin-bottom: 2rem;
}
.admin-info {
  color: #555;
}

/* Navigations-Karte zur Vorgangs-Nachverfolgung */
.admin-link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(124, 179, 66, 0.4);
  background: rgba(124, 179, 66, 0.06);
  border-radius: 12px;
  padding: 1.1rem 1.4rem;
  margin-bottom: 2.5rem;
  color: inherit;
}
.admin-link-card:hover {
  background: rgba(124, 179, 66, 0.12);
}
.admin-link-card strong {
  display: block;
  color: #558B2F;
  margin-bottom: 0.2rem;
}
.admin-link-card span {
  color: #555;
  font-size: 0.9rem;
}
.admin-link-arrow {
  font-size: 1.4rem;
  color: #7CB342;
}
.admin-section-title {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

/* Horizontal scrollbar Tabelle auf schmalen Screens (Responsive) */
.admin-table-wrap {
  overflow-x: auto;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
}
.admin-table th,
.admin-table td {
  text-align: left;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
}
.admin-table th {
  color: #558B2F;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.admin-table tbody tr:hover {
  background: #f7faf2;
}

.role-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
.role-admin {
  background: rgba(124, 179, 66, 0.18);
  color: #558B2F;
}
.role-user {
  background: rgba(0, 0, 0, 0.06);
  color: #555;
}

.admin-empty {
  text-align: center;
  color: #888;
  padding: 1.5rem;
}
.admin-msg.err {
  color: #c62828;
  font-weight: 600;
}
</style>
