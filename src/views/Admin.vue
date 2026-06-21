<script setup>
/**
 * Admin-Bereich (Übersicht / Hub). Verlinkt die Stammdaten-Verwaltung
 * (Gerichte, Benutzer) und die Nachverfolgung der Vorgänge. Der gesamte
 * Bereich ist nur für ADMINs zugänglich (adminGuard + Backend hasRole).
 */
const areas = [
  {
    to: '/admin/gerichte',
    title: 'Gerichte verwalten',
    text: 'Stammdaten der Gerichte ansehen, suchen, anlegen, bearbeiten und löschen.',
  },
  {
    to: '/admin/benutzer',
    title: 'Benutzer verwalten',
    text: 'Benutzer ansehen, durchsuchen und ihre Daten (Name, Adresse, Rolle) bearbeiten.',
  },
  {
    to: '/admin/ernaehrungsplaene',
    title: 'Vorgänge nachverfolgen',
    text: 'Alle mehrstufigen Ernährungsplan-Vorgänge mit Status, Schritt und Ereignis-Protokoll.',
  },
]
</script>

<template>
  <section class="admin container">
    <h1>Admin-Bereich</h1>
    <p class="admin-sub">
      Zentrale Verwaltung – dieser Bereich ist ausschließlich für
      Administrator:innen zugänglich.
    </p>

    <div class="admin-cards">
      <router-link v-for="a in areas" :key="a.to" :to="a.to" class="admin-link-card">
        <div>
          <strong>{{ a.title }}</strong>
          <span>{{ a.text }}</span>
        </div>
        <span class="admin-link-arrow">→</span>
      </router-link>
    </div>
  </section>
</template>

<style scoped>
.admin {
  max-width: 760px;
  padding: 3rem 1rem;
}
.admin h1 {
  margin-bottom: 0.5rem;
}
.admin-sub {
  color: #555;
  margin-bottom: 2rem;
}
.admin-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.admin-link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(124, 179, 66, 0.4);
  background: rgba(124, 179, 66, 0.06);
  border-radius: 12px;
  padding: 1.2rem 1.4rem;
  color: inherit;
}
.admin-link-card:hover {
  background: rgba(124, 179, 66, 0.12);
}
.admin-link-card strong {
  display: block;
  color: var(--color-primary-dark);
  margin-bottom: 0.25rem;
  font-size: 1.05rem;
}
.admin-link-card span {
  color: #555;
  font-size: 0.9rem;
}
.admin-link-arrow {
  font-size: 1.4rem;
  color: var(--color-primary);
}
</style>
