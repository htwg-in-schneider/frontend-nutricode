<script setup>
import FooterLink from './FooterLink.vue'
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">
      <p class="footer-copy">
        © 2026 NutriCode · Paul Bärenfänger &amp; Leon Mönch · Projektarbeit Webentwicklung SS 2026
      </p>
      <nav class="footer-links">
        <FooterLink text="Kontakt" label="Zum Kontaktformular" :to="{ path: '/', hash: '#kontakt' }" />
        <FooterLink text="Datenschutz" label="Datenschutzerklärung" to="/datenschutz" />
        <FooterLink text="Impressum" label="Impressum" to="/impressum" />
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-primary-dark);
  color: #ffffff;
  padding: 2rem 0;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
}

.footer-copy {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .footer-inner {
    flex-direction: column;
    text-align: center;
  }
}
</style>
