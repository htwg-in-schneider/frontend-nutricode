<script setup>
// Auffangseite für unbekannte URLs – verhindert eine leere Seite bei Tippfehlern
// in der Adresse oder veralteten Links und bietet den Weg zurück an.
</script>

<template>
  <section class="notfound container">
    <p class="notfound-code">404</p>
    <h1>Seite nicht gefunden</h1>
    <p class="notfound-text">
      Diese Seite gibt es nicht (mehr). Vielleicht hilft einer dieser Links weiter:
    </p>
    <div class="notfound-actions">
      <router-link to="/" class="btn btn-primary">Zur Startseite</router-link>
      <router-link to="/gerichte" class="btn btn-outline">Zu den Gerichten</router-link>
    </div>
  </section>
</template>

<style scoped>
.notfound {
  max-width: 600px;
  padding: 4rem 1rem;
  text-align: center;
  min-height: 50vh;
}
.notfound-code {
  font-size: 4rem;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0;
  line-height: 1;
}
.notfound h1 {
  margin: 0.5rem 0 1rem;
}
.notfound-text {
  color: #555;
  margin-bottom: 2rem;
}
.notfound-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
