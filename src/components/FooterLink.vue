<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: false,
    default: ''
  },
  // Interne Route (z. B. "/impressum" oder { path: '/', hash: '#kontakt' })
  // -> wird als <router-link> gerendert
  to: {
    type: [String, Object],
    required: false,
    default: null
  },
  // Externer Link -> wird als <a> gerendert
  href: {
    type: String,
    required: false,
    default: null
  }
});
</script>

<template>
  <router-link v-if="to" :to="to" class="footer-link" :aria-label="label">
    {{ text }}
  </router-link>
  <a v-else :href="href || '#'" class="footer-link" :aria-label="label">
    {{ text }}
  </a>
</template>

<style scoped>
.footer-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #ffffff;
  text-decoration: underline;
}
</style>
