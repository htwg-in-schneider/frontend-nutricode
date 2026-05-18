<script setup>
import FooterLink from './FooterLink.vue'
</script>

<template>
  <footer class="footer container">
    <p>© 2026 NutriCode · Paul Bärenfänger &amp; Leon Mönch · Projektarbeit Webentwicklung SS 2026</p>
    <nav class="footer-links">
      <FooterLink text="Kontakt" label="Kontakt" href="#" />
      <span aria-hidden="true" style="margin: 0 0.5rem">|</span>
      <FooterLink text="Datenschutz" label="Datenschutz" href="#" />
      <span aria-hidden="true" style="margin: 0 0.5rem">|</span>
      <FooterLink text="Impressum" label="Impressum" href="#" />
    </nav>
  </footer>
</template>

<style scoped>
.footer-links {
  margin-top: 0.5rem;
}
</style>
