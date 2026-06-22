<script setup>
import SpecialBanner from './components/SpecialBanner.vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import AppDialogs from './components/AppDialogs.vue'
</script>

<template>
  <div>
    <SpecialBanner />
    <Navbar />
    <router-view />
    <Footer />
    <AppDialogs />
  </div>
</template>

<style scoped></style>
