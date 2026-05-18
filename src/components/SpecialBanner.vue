<script setup>
import { ref } from 'vue'

const isVisible = ref(true)

function hideBanner() {
  isVisible.value = false
}
</script>

<template>
  <div v-if="isVisible" class="special-banner">
    <p>Neu: Generiere deinen KI-gestützten Ernährungsplan in unter 60 Sekunden.</p>
    <button class="banner-close" @click="hideBanner" aria-label="Schließen">✕</button>
  </div>
</template>

<style scoped>
.special-banner {
  background: #2d2d2d;
  color: #fff;
  text-align: center;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.special-banner p {
  margin: 0;
}
.banner-close {
  background: transparent;
  border: 0;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
}
</style>