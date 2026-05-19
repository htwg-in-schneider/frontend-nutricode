<script setup>
import SpecialBanner from './components/SpecialBanner.vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div>
    <SpecialBanner />
    <Navbar />
    <router-view />
    <Footer />
  </div>
</template>

<style scoped></style>
