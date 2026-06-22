<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'
import { useRoles } from '../composables/useRoles.js'
import { readApiError } from '../utils/apiError.js'
import { SEX_OPTIONS, ACTIVITY_LEVELS } from '../constants/nutrition.js'
import Button from '../components/Button.vue'

const { apiFetch } = useApi()
const { isAdmin } = useRoles()

const profile = ref({
  name: '', email: '', address: '', role: '',
  sex: null, age: null, heightCm: null, weightKg: null, activityLevel: null,
})
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
      body: JSON.stringify({
        name: profile.value.name,
        address: profile.value.address,
        sex: profile.value.sex || null,
        age: profile.value.age !== null && profile.value.age !== '' ? Number(profile.value.age) : null,
        heightCm: profile.value.heightCm !== null && profile.value.heightCm !== '' ? Number(profile.value.heightCm) : null,
        weightKg: profile.value.weightKg !== null && profile.value.weightKg !== '' ? Number(profile.value.weightKg) : null,
        activityLevel: profile.value.activityLevel || null,
      })
    })
    if (!res.ok) throw new Error(await readApiError(res, 'Speichern fehlgeschlagen'))
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

        <fieldset class="metrics-fieldset">
          <legend>Körperdaten <span class="hint">(für die Kalorienberechnung im Ernährungsplan)</span></legend>
          <label>
            Geschlecht
            <select v-model="profile.sex">
              <option :value="null">— nicht angegeben —</option>
              <option v-for="s in SEX_OPTIONS" :key="s.key" :value="s.key">{{ s.label }}</option>
            </select>
          </label>
          <div class="metrics-row">
            <label>
              Alter (Jahre)
              <input v-model.number="profile.age" type="number" min="1" max="120" />
            </label>
            <label>
              Größe (cm)
              <input v-model.number="profile.heightCm" type="number" min="50" max="250" />
            </label>
            <label>
              Gewicht (kg)
              <input v-model.number="profile.weightKg" type="number" min="20" max="400" step="0.1" />
            </label>
          </div>
          <label>
            Aktivitätslevel
            <select v-model="profile.activityLevel">
              <option :value="null">— nicht angegeben —</option>
              <option v-for="a in ACTIVITY_LEVELS" :key="a.key" :value="a.key">{{ a.label }}</option>
            </select>
          </label>
        </fieldset>

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
.profile-form textarea,
.profile-form select {
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}
.profile-form input:focus,
.profile-form textarea:focus,
.profile-form select:focus {
  outline: none;
  border-color: var(--color-primary);
}
.metrics-fieldset {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.metrics-fieldset legend {
  font-weight: 700;
  padding: 0 0.5rem;
}
.metrics-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.metrics-row label {
  flex: 1;
  min-width: 110px;
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
  color: var(--color-primary-dark);
}
.profile-msg.err {
  color: var(--color-danger);
}
</style>
