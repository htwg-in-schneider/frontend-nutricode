<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'
import { useRoles } from '../composables/useRoles.js'
import Button from '../components/Button.vue'

const { apiFetch } = useApi()
const { isAdmin } = useRoles()

const profile = ref({ name: '', email: '', address: '', role: '' })
const loading = ref(true)
const saved = ref(false)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await apiFetch('/api/profile')
    if (!res.ok) throw new Error('Profil konnte nicht geladen werden')
    profile.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

async function saveProfile() {
  saved.value = false
  error.value = null
  try {
    const res = await apiFetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profile.value.name, address: profile.value.address })
    })
    if (!res.ok) throw new Error('Speichern fehlgeschlagen')
    profile.value = await res.json()
    saved.value = true
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <section class="profile container">
    <h1>Mein Profil</h1>

    <p v-if="loading">Lade Profil...</p>

    <template v-else>
      <p class="profile-role">
        Rolle: <strong>{{ profile.role || (isAdmin ? 'ADMIN' : 'USER') }}</strong>
      </p>

      <form class="profile-form" @submit.prevent="saveProfile">
        <label>
          Name
          <input v-model="profile.name" type="text" required>
        </label>
        <label>
          E-Mail <span class="hint">(aus Auth0, nicht änderbar)</span>
          <input :value="profile.email" type="email" disabled>
        </label>
        <label>
          Adresse
          <textarea v-model="profile.address" rows="3" placeholder="Straße, PLZ, Ort"></textarea>
        </label>

        <div class="form-actions">
          <Button type="submit" variant="accent">Speichern</Button>
        </div>

        <p v-if="saved" class="profile-msg ok">Profil gespeichert ✓</p>
        <p v-if="error" class="profile-msg err">{{ error }}</p>
      </form>
    </template>
  </section>
</template>

<style scoped>
.profile {
  max-width: 600px;
  padding: 3rem 1rem;
}
.profile h1 {
  margin-bottom: 0.5rem;
}
.profile-role {
  color: #555;
  margin-bottom: 1.5rem;
}
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.profile-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 600;
  color: #444;
}
.profile-form .hint {
  font-weight: 400;
  color: #999;
  font-size: 0.85rem;
}
.profile-form input,
.profile-form textarea {
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}
.profile-form input:focus,
.profile-form textarea:focus {
  outline: none;
  border-color: #7CB342;
}
.profile-form input:disabled {
  background: #f3f3f3;
  color: #888;
}
.form-actions {
  margin-top: 0.5rem;
}
.profile-msg {
  margin: 0;
  font-weight: 600;
}
.profile-msg.ok {
  color: #558B2F;
}
.profile-msg.err {
  color: #c62828;
}
</style>
